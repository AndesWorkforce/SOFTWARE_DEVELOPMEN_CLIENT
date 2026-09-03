"use client";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/**
 * Rango que abarca un bucket horario, para el tooltip.
 *
 * Una etiqueta "08:00" no significa "a las 8 en punto" sino "entre 08:00 y
 * 09:00". Mostrar el rango completo evita la lectura de que la actividad
 * ocurrio en ese instante. Devuelve null si la etiqueta no es una hora: este
 * componente tambien sirve a la vista de grupo, donde las etiquetas son nombres
 * de equipo.
 */
function bucketRangeLabel(label: string): string | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(label.trim());
  if (!m) return null;
  const h = Number(m[1]);
  if (!Number.isInteger(h) || h < 0 || h > 23) return null;
  const next = (h + 1) % 24;
  return `${String(h).padStart(2, "0")}:${m[2]} - ${String(next).padStart(2, "0")}:${m[2]}`;
}

export interface ProductivityDurationChartProps {
  hourlyData: Array<{
    hour: string;
    productivity: number;
    duration: number; // in hours (decimal)
  }>;
  /**
   * Nombre de la serie. Es configurable porque este componente sirve a dos
   * metricas distintas y el rotulo fijo "Avg. Duration" describia solo una:
   *
   * - Vista de detalle: tiempo MONITOREADO dentro de cada hora (0 a 1 h). No es
   *   un promedio. Con el rotulo viejo, una sesion de 12:07 a 13:02 hacia
   *   esperar 55 min en la barra de las 13:00, cuando ahi solo caen los 2 min
   *   posteriores a las 13:00; los otros 53 pertenecen a la barra de las 12:00.
   * - Vista de grupo: `avg_duration_hours`, que si es una duracion promedio de
   *   sesion por grupo.
   */
  seriesName?: string;
}

export const ProductivityDurationChart = ({
  hourlyData,
  seriesName = "Avg. Duration",
}: ProductivityDurationChartProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatHoursToTime = (hoursDecimal: number): string => {
    const totalMinutes = Math.round(hoursDecimal * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const yAxisMax = useMemo(() => {
    const maxValue = hourlyData.reduce((max, d) => Math.max(max, d.duration || 0), 0);
    // Se redondea hacia arriba al cuarto de hora para que los ticks queden
    // limpios (interval = max / 4).
    return Math.max(1, Math.ceil(maxValue * 4) / 4);
  }, [hourlyData]);

  const option = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line", lineStyle: { color: "#E5E5E5", type: "dashed" } },
        formatter: (params: unknown) => {
          const param = Array.isArray(params) ? params[0] : params;
          if (
            param &&
            typeof param === "object" &&
            "name" in param &&
            "seriesName" in param &&
            "value" in param
          ) {
            const value = typeof param.value === "number" ? param.value : 0;
            const label = bucketRangeLabel(String(param.name)) ?? String(param.name);
            return `${label}<br/>${String(param.seriesName)}: ${formatHoursToTime(value)}`;
          }
          return "";
        },
      },
      legend: {
        data: [seriesName],
        bottom: 0,
        icon: "roundRect",
      },
      grid: {
        left: "3%",
        right: "4%",
        top: "10%",
        bottom: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        // true: cada barra ocupa el ancho de su intervalo. Con false quedaban
        // centradas sobre la marca del eje, reforzando la lectura de "a las
        // 08:00" en lugar de "entre 08:00 y 09:00".
        boundaryGap: true,
        data: hourlyData.map((d) => d.hour),
        axisLine: { lineStyle: { color: "#E5E5E5" } },
        axisLabel: {
          color: "#000000",
          fontSize: isMobile ? 9 : 11,
          rotate: 0,
          // Con 24h a ancho completo: mostrar cada 2 horas para legibilidad
          interval: hourlyData.length > 14 ? 1 : 0,
          showMinLabel: true,
          showMaxLabel: true,
        },
        axisTick: { show: true, alignWithLabel: true },
      },
      yAxis: {
        type: "value",
        name: "Duration (h)",
        min: 0,
        // El maximo se calcula del dato, no fijo en 1.
        //
        // Este componente sirve a dos fuentes con rangos distintos: en la vista
        // de detalle son horas del dia, acotadas a 1 h por construccion; en la
        // vista de grupo es `avg_duration_hours`, la duracion PROMEDIO de sesion,
        // que pasa de 1 sin problema (medido: 1.57 h). Con `max: 1` fijo esas
        // barras quedaban recortadas y el eje marcaba 60m para un promedio de
        // 1 h 34 m, subestimando un 36%.
        //
        // El piso de 1 conserva la escala del grafico horario, donde el maximo
        // real es exactamente 1.0.
        max: yAxisMax,
        interval: yAxisMax / 4,
        axisLabel: {
          formatter: (value: number) => formatHoursToTime(value),
          color: "#000000",
          fontSize: 12,
        },
        splitLine: { lineStyle: { type: "solid", color: "#F0F0F0" } },
        axisLine: { show: true, lineStyle: { color: "#E5E5E5" } },
      },
      series: [
        {
          name: seriesName,
          // Barras y no linea: el dato es una cantidad POR BUCKET, no una
          // serie continua. Con `smooth: true` la curva interpolaba entre horas
          // e inventaba actividad donde no la hubo: una jornada que arrancaba
          // 08:26 dibujaba la subida desde las 07:00, sugiriendo un comienzo
          // a las 7:26. Una barra ocupa su hora y no afirma nada fuera de ella.
          type: "bar",
          barMaxWidth: 28,
          data: hourlyData.map((d) => d.duration),
          itemStyle: {
            borderRadius: [3, 3, 0, 0],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#0097B2" },
                { offset: 1, color: "rgba(0, 151, 178, 0.45)" },
              ],
            },
          },
        },
      ],
    };
  }, [hourlyData, isMobile, yAxisMax, seriesName]);

  return (
    <div className="h-[300px] w-full min-w-0 overflow-hidden">
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};
