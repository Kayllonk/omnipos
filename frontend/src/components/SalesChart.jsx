import Chart from 'react-apexcharts'

export default function SalesChart() {
  const series = [
    {
      name: 'Vendas',
      data: [28, 35, 42, 38, 55, 62, 74, 68, 79, 88, 95, 102]
    }
  ]

  const options = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      foreColor: '#cbd5e1',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05
      }
    },
    grid: {
      borderColor: 'rgba(255,255,255,.08)',
      strokeDashArray: 4
    },
    xaxis: {
      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    },
    yaxis: {
      labels: {
        formatter: (value) => value.toFixed(0)
      }
    },
    colors: ['#7c3aed'],
    tooltip: {
      theme: 'dark'
    }
  }

  return <Chart options={options} series={series} type="area" height={320} />
}