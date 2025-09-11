Refactorizar Modal Info Planetas:
    - Trasladar logica a Game
    - Usar uiCallbacks

        this.uiCallbacks = {
            onOrbitEnter: uiCallbacks.onOrbitEnter || function() {},
            onOrbitExit: uiCallbacks.onOrbitExit || function() {}
        };
    - Quizas pasar el engage orbit a ship y ejecutarlo como callback tmbn (?)
    - Hacer que los datos se actualicen a tiempo real (coordenadas de planeta)
