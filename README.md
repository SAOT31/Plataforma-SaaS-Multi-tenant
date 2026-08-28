# Plataforma SaaS Multi-Tenant de Soporte y PQRS

## Descripción General

Plataforma de software como servicio (SaaS) multi-inquilino diseñada para la gestión centralizada de peticiones, quejas, reclamos y sugerencias (PQRS). El sistema permite a múltiples empresas gestionar su soporte al cliente a través de un widget web incrustable. La plataforma utiliza Inteligencia Artificial para desviar consultas repetitivas mediante la generación aumentada por recuperación (RAG) y realiza un triaje automático de los tickets entrantes.

El proyecto está desarrollado con una arquitectura limpia en .NET 10 para el backend, PostgreSQL con pgvector para el almacenamiento híbrido y búsqueda de similitud, y React con TypeScript para el panel de administración.

## Características Principales

- Aislamiento Multi-Tenant: Separación estricta de datos por empresa a través de identificadores de inquilino (TenantId) validados en cada petición HTTP y reclamos de JWT. El acceso y el origen de las peticiones (CORS) se validan dinámicamente según la configuración de cada inquilino.
- Base de Datos Vectorial: Implementación de PostgreSQL con pgvector para almacenar y consultar vectores (embeddings) de 768 dimensiones utilizando índices HNSW y operadores de similitud del coseno.
- Inteligencia Artificial y RAG: Búsqueda semántica en tiempo real sobre los artículos de la base de conocimiento publicados por cada inquilino. El sistema responde preguntas frecuentes de forma autónoma antes de que el usuario decida enviar un ticket formal.
- Triaje Automatizado: Extracción estructurada de datos a través de IA para clasificar cada nuevo ticket en tipo, prioridad y sentimiento, generando un resumen ejecutivo para los agentes.
- Notificaciones en Tiempo Real: Comunicación bidireccional mediante SignalR para alertar a los grupos de agentes correspondientes sobre nuevos tickets o cambios de estado críticos.
- Widget Web Incrustable: Script independiente escrito en JavaScript puro que utiliza Shadow DOM para aislar sus estilos CSS del sitio web anfitrión.
- Seguridad y Roles: Sistema de autenticación con JSON Web Tokens (JWT) y separación de permisos operativos entre Administradores y Agentes.

## Arquitectura del Sistema

La solución se divide en tres componentes principales orquestados mediante contenedores:

1. Backend (API): Estructurado en cuatro capas bajo los principios SOLID (Dominio, Aplicación, Infraestructura, API). No existen dependencias externas en el núcleo de la aplicación.
2. Frontend (Panel de Administración): Aplicación web estática (React) que consume la API REST, permite la gestión de los tickets, la base de conocimiento y la configuración de seguridad del inquilino.
3. Base de Datos: Motor PostgreSQL equipado con la extensión pgvector para el soporte de las operaciones de machine learning e Inteligencia Artificial.

## Guía de Instalación

### Requisitos Previos

- Docker y Docker Compose instalados en el sistema.
- Puertos 3000, 5050 y 5432 disponibles.

### Puesta en Marcha

El sistema completo está empaquetado para ejecutarse localmente. Para iniciar todos los servicios, abra una terminal en el directorio raíz del proyecto y ejecute:

```bash
docker-compose up --build -d
```

Este comando descargará las imágenes necesarias, compilará el código de backend y frontend, y levantará la base de datos con los datos iniciales pre-cargados.

### Accesos Locales

- Panel de Administración Frontend: http://localhost:3000
- API REST Backend: http://localhost:5050
- Documentación Swagger: http://localhost:5050/swagger

## Credenciales de Prueba (Datos Iniciales)

El sistema genera automáticamente datos de prueba durante el primer inicio.

Empresa 1 (TechNova Solutions)
- Administrador: admin@technova.com / Password123!
- Agente de Soporte: agent@technova.com / Password123!

Empresa 2 (Apex Global Store)
- Administrador: admin@apexstore.com / Password123!

## Integración del Widget

Para instalar el widget de soporte en el sitio web de un inquilino, se debe agregar el siguiente código HTML justo antes de la etiqueta de cierre del cuerpo (body). El identificador del inquilino (data-tenant) asegura que el widget se comunique exclusivamente con los datos de esa empresa.

```html
<script
  src="http://localhost:5050/widget/pqrs-widget.js"
  data-tenant="11111111-1111-1111-1111-111111111111"
  data-api="http://localhost:5050">
</script>
```

---

# Multi-Tenant Support and PQRS SaaS Platform

## General Description

A multi-tenant Software as a Service (SaaS) platform designed for the centralized management of petitions, complaints, claims, and suggestions (PQRS). The system allows multiple companies to manage their customer support through an embeddable web widget. The platform uses Artificial Intelligence to deflect repetitive queries via Retrieval-Augmented Generation (RAG) and performs automated triage of incoming tickets.

The project is developed using a clean architecture in .NET 10 for the backend, PostgreSQL with pgvector for hybrid storage and similarity search, and React with TypeScript for the administration dashboard.

## Key Features

- Multi-Tenant Isolation: Strict data separation per company through tenant identifiers (TenantId) validated on every HTTP request and JWT claims. Access and request origins (CORS) are dynamically validated based on each tenant's configuration.
- Vector Database: PostgreSQL implementation with pgvector to store and query 768-dimensional vectors (embeddings) using HNSW indexes and cosine similarity operators.
- Artificial Intelligence and RAG: Real-time semantic search over the knowledge base articles published by each tenant. The system answers frequently asked questions autonomously before the user decides to submit a formal ticket.
- Automated Triage: Structured data extraction via AI to classify each new ticket into type, priority, and sentiment, generating an executive summary for the agents.
- Real-Time Notifications: Bidirectional communication via SignalR to alert the corresponding agent groups about new tickets or critical status changes.
- Embeddable Web Widget: Standalone script written in plain JavaScript that utilizes Shadow DOM to isolate its CSS styles from the host website.
- Security and Roles: Authentication system with JSON Web Tokens (JWT) and operational permission separation between Administrators and Agents.

## System Architecture

The solution is divided into three main components orchestrated through containers:

1. Backend (API): Structured into four layers following SOLID principles (Domain, Application, Infrastructure, API). There are no external dependencies in the application core.
2. Frontend (Administration Dashboard): Static web application (React) that consumes the REST API, allowing the management of tickets, knowledge base, and tenant security configuration.
3. Database: PostgreSQL engine equipped with the pgvector extension to support machine learning and Artificial Intelligence operations.

## Installation Guide

### Prerequisites

- Docker and Docker Compose installed on the system.
- Ports 3000, 5050, and 5432 available.

### Getting Started

The complete system is packaged to run locally. To start all services, open a terminal in the project's root directory and run:

```bash
docker-compose up --build -d
```

This command will download the necessary images, compile the backend and frontend code, and start the database with the initial data pre-loaded.

### Local Access

- Frontend Administration Dashboard: http://localhost:3000
- Backend REST API: http://localhost:5050
- Swagger Documentation: http://localhost:5050/swagger

## Test Credentials (Seed Data)

The system automatically generates test data during the first startup.

Company 1 (TechNova Solutions)
- Administrator: admin@technova.com / Password123!
- Support Agent: agent@technova.com / Password123!

Company 2 (Apex Global Store)
- Administrator: admin@apexstore.com / Password123!

## Widget Integration

To install the support widget on a tenant's website, the following HTML code must be added just before the closing body tag. The tenant identifier (data-tenant) ensures that the widget communicates exclusively with that company's data.

```html
<script
  src="http://localhost:5050/widget/pqrs-widget.js"
  data-tenant="11111111-1111-1111-1111-111111111111"
  data-api="http://localhost:5050">
</script>
```
