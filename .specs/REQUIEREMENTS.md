# App 10: Administrador de Gastos Compartidos
Desarrollar una aplicación para gestionar gastos entre grupos de personas.

##  Funcionalidades requeridas:
- Crear grupos con múltiples integrantes
- Registrar gastos indicando: descripción, monto, moneda, persona que pagó y participantes del gasto
- Integrar la API de exchangerate.host para convertir automáticamente todos los gastos a una moneda base del grupo (ej: USD o ARS)
- Guardar grupos, miembros y gastos en un archivo JSON
- Calcular y mostrar el balance simplificado: quién debe pagar y cuánto a quién (no es necesario optimizar al mínimo las transacciones, pueden usar un algoritmo básico donde cada persona con saldo negativo pague proporcionalmente a quienes tienen saldo positivo)
- Mostrar gráficos de gastos totales por persona y por categoría (usar Chart.js, Recharts u otra librería)

## Aspectos a considerar:
- La API de exchangerate.host es gratuita y no requiere autenticación para uso básico
- Para el balance, calculen primero cuánto pagó cada uno vs. cuánto debería haber pagado según su participación


##  Indicaciones Generales
- La aplicacion deben ser desarrolladas utilizando Next.js como framework principal.
- Como no se abordó el tema de autenticación con JWT en el curso, ninguna aplicación debe implementar un sistema completo de registro y login de usuarios. Sin embargo, cuando sea necesario identificar a los usuarios temporalmente (por ejemplo, en un chat o para asociar datos), pueden utilizar IDs temporales generados en el cliente (por ejemplo, mediante UUID) que se almacenen en localStorage o sessionStorage.

## Requisitos técnicos:
- Utilicen las dependencias y librerías que consideren necesarias para resolver cada problema
- Prioricen escribir código seguro, mantenible y que siga buenas prácticas
- Documenten las decisiones técnicas importantes
- La persistencia de datos debe realizarse mediante archivos JSON (simulando una base de datos simple)
- La UI puede ser desarrollada con [v0.app](https://v0.app/) u otra herramienta 


## Arquitectura
- Utilizar un estilo en capas con responsabilidades claramente diferenciadas:
  - UI: interaccion con el usuario
  - Hooks: estado y sincronizacion con el servidor
  - Services: encapsular llamadas http a la api
  - API: validar y procesar las request http
  - DB: persistencia (sin dbms, solo archivos json)

- Crear los Hooks con TanStack Query 
- Utilizar App Router para la navegacion (usar el componente Link)
- Utilizar Api Routes para implemetar los endpoints necesarios
- Estructura sugerida (los nombres son esquematicos)


```
app/
├─ api/
│  └─ expenses/
│     ├─ route.ts
│     └─ [id]/route.ts
├─ lib/
│  └─ database.ts
├─ services/
│  └─ expenses.service.ts
├─ hooks/
│  └─ useExpenses.ts
├─ components/
│  ├─ ExpenseCard.tsx
│  └─ ExpenseList.tsx
└─ providers/
```

