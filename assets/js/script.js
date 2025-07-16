// Controlar los elementos del HTML desde JS

const inputMonto = document.getElementById("monto");
const selectMoneda = document.getElementById("moneda");
const btnBuscar = document.getElementById("btnBuscar");
const pResultado = document.getElementById("resultado");


const baseUrl = 'https://mindicador.cl/api/'



//Funcion para traer Monedas. 

async function getMonedas() {
    try {
        const res = await fetch(baseUrl)
        const data = await res.json()
        const monedasPermitidas = ['dolar', 'euro', 'bitcoin']

        monedasPermitidas.forEach((codigo) => {
            const moneda = data[codigo]
            const option = document.createElement('option')
            option.value = codigo
            option.textContent = moneda.nombre
            selectMoneda.appendChild(option)

        })

    } catch (error) {
        console.log(error)
    }
}

//funcion para covertir

async function convertirMoneda() {
    try {
        const montoPesos = Number(inputMonto.value)
        const codigoMoneda = selectMoneda.value

        if (!codigoMoneda) {
            pResultado.textContent = 'Por favor selecciona una moneda'
            return
        }

        const res = await fetch(`https://mindicador.cl/api/${codigoMoneda}`)
        const data = await res.json()
        const valorMoneda = data.serie[0].valor

        const resultado = montoPesos / valorMoneda



        pResultado.textContent = `${montoPesos} pesos Chileno son aprox ${resultado.toFixed(2)} ${codigoMoneda}`;
        renderGrafico(codigoMoneda);


    } catch (error) {
        console.log(error)
    }
}


getMonedas()

// Grafico

btnBuscar.addEventListener('click', convertirMoneda)






let myChart; // variable global para destruir el gráfico anterior si existe

async function renderGrafico(moneda) {
    try {
        const res = await fetch(`https://mindicador.cl/api/${moneda}`);
        const data = await res.json();

        const ultimos10 = data.serie.slice(0, 10).reverse(); // Últimos 10 días en orden cronológico

        const labels = ultimos10.map((item) =>
            new Date(item.fecha).toLocaleDateString("es-CL")
        );
        const valores = ultimos10.map((item) => item.valor);

        const config = {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: `Historial últimos 10 días (${moneda.toUpperCase()})`,
                        data: valores,
                        borderColor: "rgb(255, 99, 132)",              // Línea rosada
                        backgroundColor: "rgba(255, 99, 132, 0.2)",     // Fondo suave rosado
                        fill: false,
                        tension: 0.3,                                   // Suaviza las líneas
                        pointRadius: 5,                                 // Tamaño de los puntos
                        pointBackgroundColor: "rgb(255, 99, 132)",      // Puntos rosados
                        pointBorderColor: "white",
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top"
                    },
                    title: {
                        display: true,
                        text: "Historial de moneda"
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: "#000"
                        }
                    },
                    y: {
                        ticks: {
                            color: "#000"
                        }
                    }
                }
            }
        };

        // Destruye el gráfico anterior si existe
        if (myChart) {
            myChart.destroy();
        }

        const ctx = document.getElementById("grafico").getContext("2d");
        myChart = new Chart(ctx, config);

    } catch (error) {
        console.error("Error al cargar el gráfico:", error);
        document.getElementById("grafico").outerHTML =
            "<p>Error al cargar el gráfico</p>";
    }
}


