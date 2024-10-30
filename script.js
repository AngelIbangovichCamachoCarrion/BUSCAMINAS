// Mostrar el nombre guardado si ya existe en localStorage
const nombreJugador = localStorage.getItem("nombreJugador");
if (nombreJugador) {
    document.getElementById("nombre-jugador").textContent = `Jugador: ${nombreJugador}`;
} else {
    document.getElementById("nombre-jugador").textContent = "Jugador: Sin nombre";
}

let filas = 10;
let columnas = 10;
let minas = 20;
let tablero = [];
let primerMovimiento = true;
let juegoTerminado = false;

// Configuración de dificultad almacenada en localStorage
function guardarDificultad(filas, columnas, minas) {
    localStorage.setItem("dificultad", JSON.stringify({ filas, columnas, minas }));
}

function cargarDificultad() {
    const dificultadGuardada = JSON.parse(localStorage.getItem("dificultad"));
    if (dificultadGuardada) {
        filas = dificultadGuardada.filas;
        columnas = dificultadGuardada.columnas;
        minas = dificultadGuardada.minas;
    }
}

function nuevoJuego() {
    cargarDificultad();
    juegoTerminado = false;
    primerMovimiento = true;
    tablero = generarTablero(filas, columnas, minas);
    actualizarTablero();
}

function generarTablero(filas, columnas, minas) {
    let tablero = [];
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
    const tableroElement = document.getElementById('tablero');
    tableroElement.innerHTML = '';

    for (let i = 0; i < filas; i++) {
        const fila = document.createElement('tr');
        for (let j = 0; j < columnas; j++) {
            const celda = document.createElement('td');
            celda.dataset.x = i;
            celda.dataset.y = j;

            if (tablero[i][j].descubierto) {
                celda.classList.add('celda-presionada');
                celda.textContent = tablero[i][j].mina ? '💣' : (tablero[i][j].valor || '');
                if (tablero[i][j].mina) celda.classList.add('boom');
            } else if (tablero[i][j].marcado) {
                celda.classList.add('bandera');
                celda.textContent = '🚩';
            }

            celda.onclick = descubrirCelda;
            celda.oncontextmenu = marcarCelda;
            fila.appendChild(celda);
        }
        tableroElement.appendChild(fila);
    }
}

function descubrirCelda(event) {
    if (juegoTerminado) return; // Termina si el juego ya ha finalizado

    let x = parseInt(event.target.dataset.x);
    let y = parseInt(event.target.dataset.y);

    // Comprueba si la celda no está descubierta ni marcada
    if (!tablero[x][y].descubierto && !tablero[x][y].marcado) {
        if (primerMovimiento) {
            if (tablero[x][y].mina) {
                do {
                    tablero = generarTablero(filas, columnas, minas);
                } while (tablero[x][y].mina); // Genera un nuevo tablero sin mina en el primer movimiento
            }
            primerMovimiento = false; // Cambia el estado después del primer movimiento
        }

        // Descubre la celda
        tablero[x][y].descubierto = true;
        event.target.classList.add("celda-presionada");

        // Si la celda es mina, termina el juego
        if (tablero[x][y].mina) {
            mostrarTodasLasMinas();
            juegoTerminado = true;
            event.target.classList.add("boom");
            setTimeout(() => alert("¡Has perdido!"), 100);
        } else if (tablero[x][y].valor === 0) {
            descubrirAdyacentes(x, y); // Descubre celdas adyacentes si el valor es 0
        }

        actualizarTablero(); // Actualiza el tablero
        verificarEstadoJuego(); // Verifica si el jugador ha ganado
    }
}


function descubrirAdyacentes(x, y) {
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            let nx = x + dx;
            let ny = y + dy;
            if (nx >= 0 && nx < filas && ny >= 0 && ny < columnas && !tablero[nx][ny].descubierto) {
                tablero[nx][ny].descubierto = true;
                if (tablero[nx][ny].valor === 0) descubrirAdyacentes(nx, ny);
            }
        }
    }
}

function marcarCelda(event) {
    event.preventDefault();
    let x = parseInt(event.target.dataset.x);
    let y = parseInt(event.target.dataset.y);
    if (!tablero[x][y].descubierto) {
        tablero[x][y].marcado = !tablero[x][y].marcado;
        actualizarTablero();
    }
}

function mostrarTodasLasMinas() {
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            if (tablero[i][j].mina) tablero[i][j].descubierto = true;
        }
    }
}

function verificarEstadoJuego() {
    // Contador de celdas descubiertas
    let celdasDescubiertas = 0;
    let celdasTotal = filas * columnas - minas; // Total de celdas sin minas

    // Recorre el tablero y cuenta las celdas descubiertas
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            if (tablero[i][j].descubierto) {
                celdasDescubiertas++;
            }
        }
    }

    // Verifica si se han descubierto todas las celdas que no tienen minas
    if (celdasDescubiertas === celdasTotal) {
        juegoTerminado = true; // Termina el juego
        setTimeout(() => alert("¡Felicidades! Has ganado."), 100); // Muestra el mensaje de victoria
    }
}


const dificultadButtons = document.querySelectorAll('.dificultad');
dificultadButtons.forEach(button => {
    button.addEventListener('click', () => {
        const dificultad = button.dataset.dificultad;
        establecerDificultad(dificultad);
        nuevoJuego();
    });
});

// Abrir ajustes
document.getElementById("Ajustes").addEventListener("click", () => {
    document.getElementById("ajustes-modal").style.display = "block";
});

// Cerrar ajustes
document.getElementById("cerrar-ajustes").addEventListener("click", () => {
    document.getElementById("ajustes-modal").style.display = "none";
});

// Guardar ajustes
document.getElementById("guardar-ajustes").addEventListener("click", () => {
    filas = parseInt(document.getElementById("filas").value);
    columnas = parseInt(document.getElementById("columnas").value);
    minas = parseInt(document.getElementById("minas").value);
    
    // Guardar la nueva dificultad
    guardarDificultad(filas, columnas, minas);
    
    // Iniciar un nuevo juego con la nueva configuración
    nuevoJuego();
    
    alert("Ajustes guardados y juego reiniciado!");
});


function establecerDificultad(dificultad) {
    switch (dificultad) {
        case 'facil': [filas, columnas, minas] = [8, 8, 10]; break;
        case 'medio': [filas, columnas, minas] = [10, 10, 20]; break;
        case 'dificil': [filas, columnas, minas] = [12, 12, 30]; break;
        case 'hardcore': [filas, columnas, minas] = [14, 14, 40]; break;
        case 'leyenda': [filas, columnas, minas] = [16, 16, 50]; break;
        default: [filas, columnas, minas] = [10, 10, 20];
    }
    guardarDificultad(filas, columnas, minas);
}

document.getElementById("juego-nuevo").addEventListener("click", nuevoJuego);

document.addEventListener("DOMContentLoaded", () => {
    cargarDificultad();
    nuevoJuego();
});


window.onclick = function(event) {
    const modal = document.getElementById("ajustes-modal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
nuevoJuego();