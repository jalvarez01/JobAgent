"""
Builder del grafo de agentes con LangGraph.

Flujo:
  perfil_agent → vacantes_agent → recomendacion_agent → postulacion_agent → seguimiento_agent

Cada nodo es una función pura que recibe el estado y devuelve actualizaciones.
"""
from langgraph.graph import StateGraph, END

from backend.graph.state import AgentState
from backend.domain.agents.perfil_agent import perfil_node
from backend.domain.agents.vacantes_agent import vacantes_node
from backend.domain.agents.recomendacion_agent import recomendacion_node
from backend.domain.agents.postulacion_agent import postulacion_node
from backend.domain.agents.seguimiento_agent import seguimiento_node


def build_graph() -> StateGraph:
    """Construye y compila el grafo de agentes."""

    graph = StateGraph(AgentState)

    # Registrar nodos
    graph.add_node("perfil", perfil_node)
    graph.add_node("vacantes", vacantes_node)
    graph.add_node("recomendacion", recomendacion_node)
    graph.add_node("postulacion", postulacion_node)
    graph.add_node("seguimiento", seguimiento_node)

    # Definir flujo
    graph.set_entry_point("perfil")
    graph.add_edge("perfil", "vacantes")
    graph.add_edge("vacantes", "recomendacion")
    graph.add_edge("recomendacion", "postulacion")
    graph.add_edge("postulacion", "seguimiento")
    graph.add_edge("seguimiento", END)

    return graph.compile()


# Singleton del grafo compilado
_compiled_graph = None


def get_graph():
    """Retorna el grafo compilado (singleton)."""
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph
