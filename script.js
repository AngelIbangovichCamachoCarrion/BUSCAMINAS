  // Mostrar el nombre guardado si ya existe en localStorage
  const nombreJugador = localStorage.getItem("nombreJugador");
  if (nombreJugador) {
      document.getElementById("nombre-jugador").textContent = `Jugador: ${nombreJugador}`;
  } else {
      document.getElementById("nombre-jugador").textContent = "Jugador: Sin nombre"; // O cualquier otro texto que desees mostrar
  }
let filas = 10;
        let columnas = 10;
        let minas = 20;
        let tablero = [];


        let primerMovimiento = true;
        let juegoTerminado = false;
    
        function nuevoJuego() {
            juegoTerminado = false;
            primerMovimiento = true;
            tablero = generarTablero(filas, columnas, minas);
            actualizarTablero();
          }

          function generarTablero(filas, columnas, minas) {
            let tablero = [];
            // Inicializar tablero vacío
            for (let i = 0; i < filas; i++) {
              tablero[i] = [];
              for (let j = 0; j < columnas; j++) {
                tablero[i][j] = {
                  valor: 0,
                  descubierto: false,
                  marcado: false,
                  mina: false
                };
              }
            }

            let minasColocadas = 0;
            while (minasColocadas < minas) {
                let x = Math.floor(Math.random() * filas);
                let y = Math.floor(Math.random() * columnas);
                if (!tablero[x][y].mina) {
                    tablero[x][y].mina = true;
                    minasColocadas++;
                }
            }
            for (let i = 0; i < filas; i++) {
                for (let j = 0; j < columnas; j++) {
                    if (!tablero[i][j].mina) {
                        let count = 0;
                        for (let dx = -1; dx <= 1; dx++) {
                            for (let dy = -1; dy <= 1; dy++) {
                                let nx = i + dx;
                                let ny = j + dy;
                                if (nx >= 0 && nx < filas && ny >= 0 && ny < columnas && tablero[nx][ny].mina) {
                                    count++;
                                }
                            }
                        }
                        tablero[i][j].valor = count;
                    }
                }
            }
            return tablero;
        }

        function actualizarTablero() {
            let tablaHTML = document.getElementById("tablero");
            tablaHTML.innerHTML = "";
            for (let i = 0; i < filas; i++) {
                let fila = document.createElement("tr");
                for (let j = 0; j < columnas; j++) {
                    let celda = document.createElement("td");
                    celda.dataset.x = i;
                    celda.dataset.y = j;
                    celda.addEventListener("click", descubrirCelda);
                    celda.addEventListener("contextmenu", marcarCelda);
        
                    // Aquí se añade la clase para las celdas descubiertas
                    if (tablero[i][j].descubierto) {
                        celda.classList.add("celda-descubierta"); // Añadir clase para pintar
                        if (tablero[i][j].mina) {
                            celda.innerHTML = '<i class="fas fa-bomb"></i>'; // Muestra el icono de la bomba
                            celda.classList.add("boom"); // Aplica la clase boom
                        } else if (tablero[i][j].valor > 0) {
                            celda.textContent = tablero[i][j].valor;
                        }
                    } else if (tablero[i][j].marcado) {
                        celda.textContent = "!";
                        celda.classList.add("bandera");
                    }
                    fila.appendChild(celda);
                }
                tablaHTML.appendChild(fila);
            }
        }
        
        

        function descubrirCelda(event) {
            if (juegoTerminado) {
                return;
            }

            let x = parseInt(event.target.dataset.x);
            let y = parseInt(event.target.dataset.y);
            if (!tablero[x][y].descubierto && !tablero[x][y].marcado) {
                if (primerMovimiento) {
                    while (tablero[x][y].mina) {
                        nuevoJuego();
                    }
                    primerMovimiento = false;
                }
                tablero[x][y].descubierto = true;
                if (tablero[x][y].mina) {
                    for (let i = 0; i < filas; i++) {
                        for (let j = 0; j < columnas; j++) {
                            if (tablero[i][j].mina) {
                                tablero[i][j].descubierto = true;
                            }
                        }
                    }
                    mostrarMensaje("Perdiste", "¡Haz clic en 'Juego Nuevo' para intentar de nuevo!");
                    juegoTerminado = true;
                } else {
                    if (tablero[x][y].valor === 0) {
                        for (let dx = -1; dx <= 1; dx++) {
                            for (let dy = -1; dy <= 1; dy++) {
                                let nx = x + dx;
                                let ny = y + dy;
                                if (nx >= 0 && nx < filas && ny >= 0 && ny < columnas && !tablero[nx][ny].descubierto) {
                                    descubrirCelda({
                                        target: {
                                            dataset: {
                                                x: nx,
                                                y: ny
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
                actualizarTablero();
                verificarVictoria();
            }
        }

        function verificarVictoria() {
            let todasDescubiertas = true;
            for (let i = 0; i < filas; i++) {
                for (let j = 0; j < columnas; j++) {
                    if (!tablero[i][j].descubierto && !tablero[i][j].mina) {
                        todasDescubiertas = false;
                    }
                }
            }
            if (todasDescubiertas) {
                mostrarMensaje("Ganaste", "¡Felicidades, has encontrado todas las celdas seguras!");
                juegoTerminado = true;
            }
        }

        function marcarCelda(event) {
            event.preventDefault(); // Evitar menú contextual
            let x = parseInt(event.target.dataset.x);
            let y = parseInt(event.target.dataset.y);
            if (!tablero[x][y].descubierto) {
                tablero[x][y].marcado = !tablero[x][y].marcado;
                actualizarTablero();
            }
        }

        function mostrarMensaje(titulo, mensaje) {
            document.getElementById("mensaje-texto").innerText = mensaje;
            document.getElementById("mensaje-modal").style.display = "flex";
            document.getElementById("cerrar").onclick = function () {
                document.getElementById("mensaje-modal").style.display = "none";
            };
        }

        function ajustarDificultad() {
            const dificultad = document.getElementById("dificultad").value;
            switch (dificultad) {
                case "facil":
                    filas = 8;
                    columnas = 8;
                    minas = 10;
                    break;
                case "medio":
                    filas = 12;
                    columnas = 12;
                    minas = 20;
                    break;
                case "dificil":
                    filas = 16;
                    columnas = 16;
                    minas = 40;
                    break;
                case "muy-dificil":
                    filas = 20;
                    columnas = 20;
                    minas = 80;
                    break;
            }
        }            

        document.getElementById("juego-nuevo").addEventListener("click", nuevoJuego);
        document.getElementById("Ajustes").addEventListener("click", () => {
            document.getElementById("ajustes-modal").style.display = "flex";
        });

        document.getElementById("cerrar-ajustes").onclick = function () {
            document.getElementById("ajustes-modal").style.display = "none";
        };

        document.getElementById("guardar-ajustes").onclick = function () {
            let filasInput = document.getElementById("filas").value;
            let columnasInput = document.getElementById("columnas").value;
            let minasInput = document.getElementById("minas").value;

            filas = parseInt(filasInput);
            columnas = parseInt(columnasInput);
            minas = parseInt(minasInput);
            ajustarDificultad();
            nuevoJuego();
        };

        window.onclick = function (event) {
            if (event.target == document.getElementById("ajustes-modal")) {
                document.getElementById("ajustes-modal").style.display = "none";
            }
            if (event.target == document.getElementById("mensaje-modal")) {
                document.getElementById("mensaje-modal").style.display = "none";
            }
        };

        nuevoJuego();