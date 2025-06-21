    const chart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
            'rgb(255, 159, 64)',
            'rgb(199, 199, 199)',
            'rgb(83, 102, 255)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Distribución por Categorías'
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return '$' + Number(value).toLocaleString('es-CO');
              }
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => {
      try {
        chart.destroy();
      } catch (error) {
        console.warn('Error al destruir gráfico:', error);
      }
    });
    this.charts = [];
  }
}
