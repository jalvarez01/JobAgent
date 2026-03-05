# recommendation_agent.py

# Simulación de vacantes
vacantes = [
    {"titulo": "Backend Developer", "skills": ["python", "api", "sql"]},
    {"titulo": "Data Analyst", "skills": ["python", "excel", "sql"]},
    {"titulo": "Frontend Developer", "skills": ["javascript", "react"]},
    {"titulo": "AI Engineer", "skills": ["python", "machine learning"]},
]

# perfil delñ usuario
perfil_usuario = {
    "skills": ["python", "sql"]
}


def recomendar_vacantes(perfil, vacantes):
    recomendaciones = []

    for vacante in vacantes:
        coincidencias = len(set(perfil["skills"]) & set(vacante["skills"]))
        recomendaciones.append((vacante["titulo"], coincidencias))

    recomendaciones.sort(key=lambda x: x[1], reverse=True)

    return recomendaciones


if __name__ == "__main__":
    resultados = recomendar_vacantes(perfil_usuario, vacantes)

    print("vacantes recomendadas:")
    for vacante in resultados:
        print(vacante)