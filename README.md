# 🇺🇸 USCIS Naturalization Interview Practice Tool

## Enhanced with Real USCIS Officer Interview Patterns

Una herramienta revolucionaria de práctica para entrevistas de naturalización estadounidense, entrenada con patrones reales extraídos de videos oficiales de USCIS.

### 🎯 **Demo en Vivo**
👉 **[Probar la Herramienta](https://tu-usuario.github.io/uscis-interview-tool)**

---

## ✨ **Características Principales**

### 🎥 **Entrenada con Videos Reales**
- Patrones auténticos de conversación de oficiales USCIS
- Flujos de entrevista basados en casos reales  
- Manejo de situaciones complejas como oficiales verdaderos

### 🤖 **Inteligencia Artificial Avanzada**
- Conversaciones naturales y realistas
- Adaptación automática según el perfil del usuario
- Detección inteligente de factores de riesgo

### 🎯 **Personalización Total**
- Compatible con formulario N-400 personalizado
- Preguntas específicas según tu caso
- Análisis de riesgo en tiempo real

### 🔒 **100% Privado y Seguro**
- Todo el procesamiento es local (client-side)
- No se envían datos a servidores externos
- Compatible con GDPR y regulaciones de privacidad

---

## 🚀 **Funcionalidades**

### **📚 Módulos de Aprendizaje**
- ✅ **Estudio**: Las 100 preguntas oficiales EN/ES
- ✅ **Práctica**: Quiz con múltiple opción y feedback
- ✅ **Entrevista Estándar**: Simulación básica
- ✅ **Entrevista Personalizada**: Basada en tu N-400

### **🎭 Simulación Realista**
- ✅ **7 Fases de Entrevista**: Opening → Eligibility → Background → Civics → English → Oath → Decision
- ✅ **Progreso Visual**: Barra de progreso con tiempo estimado
- ✅ **Sugerencias por Fase**: Tips específicos en modo entrenamiento
- ✅ **Análisis de Riesgo**: Detección automática de áreas problemáticas

### **🔊 Características Avanzadas**
- ✅ **Voice Input**: Reconocimiento de voz (Web Speech API)
- ✅ **Text-to-Speech**: Lectura de preguntas del oficial
- ✅ **Modo Offline**: Funciona sin conexión a internet
- ✅ **Export Results**: Descarga resultados en JSON
- ✅ **Mobile Responsive**: Optimizado para todos los dispositivos

---

## 📁 **Estructura del Proyecto**

```
uscis-interview-tool/
├── index.html                          # Interfaz principal
├── modules/
│   └── quick-ai-engine.js              # Motor de IA
├── data/
│   ├── curated_interview_patterns.json # Patrones reales curados
│   ├── civics_2008.json                # 100 preguntas oficiales
│   └── n400_profile.sample.json        # Ejemplo de perfil N-400
├── README.md                           # Este archivo
└── LICENSE                             # Licencia del proyecto
```

---

## 🛠️ **Instalación y Uso**

### **Opción 1: GitHub Pages (Recomendado)**
1. **Fork** este repositorio
2. Ve a **Settings** → **Pages**
3. Selecciona **Source: Deploy from branch**
4. Elige **Branch: main**
5. Tu app estará disponible en: `https://tu-usuario.github.io/uscis-interview-tool`

### **Opción 2: Local Development**
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/uscis-interview-tool.git
cd uscis-interview-tool

# Servir localmente (Python)
python -m http.server 8000

# O con Node.js
npx serve .

# Abrir en navegador
# http://localhost:8000
```

### **Opción 3: Deploy en Netlify**
1. **Fork** este repositorio
2. Conecta con **[Netlify](https://netlify.com)**
3. Deploy automático desde GitHub
4. Tu app estará en: `https://tu-app.netlify.app`

---

## 🎯 **Cómo Usar la Herramienta**

### **1. Configurar Entrevista**
- Selecciona tipo: **Standard** o **Personalized**
- Elige modo: **Training** (con ayudas) o **Official** (realista)
- Configura idioma: **English** o **English + Spanish**

### **2. Entrevista Personalizada (Opcional)**
- Sube tu **formulario N-400** en formato JSON
- El AI generará preguntas específicas para tu caso
- Incluye análisis de factores de riesgo

### **3. Practicar**
- Responde las preguntas del oficial AI
- Usa **Voice Input** para práctica oral
- Recibe **sugerencias en tiempo real** (modo training)
- Monitorea tu **progreso visual** por fases

### **4. Resultados**
- Obtén **summary completo** de tu entrevista
- Recibe **recomendaciones personalizadas**
- **Exporta resultados** para seguimiento

---

## 🔧 **Personalización e Integración**

### **Integrar en tu Sitio Web**
```html
<!-- iFrame Integration -->
<iframe 
    src="https://tu-usuario.github.io/uscis-interview-tool" 
    width="100%" 
    height="800" 
    frameborder="0"
    title="USCIS Interview Practice">
</iframe>
```

### **Personalizar Branding**
```css
/* Cambiar colores principales */
:root {
    --primary-color: #tu-color;
    --secondary-color: #tu-color-2;
}
```

### **Configurar Analytics**
```javascript
// Google Analytics tracking
gtag('event', 'interview_started', {
    'event_category': 'USCIS_Practice'
});
```

---

## 📊 **Datos y Privacidad**

### **Fuentes de Datos**
- **100 Preguntas Cívicas**: Versión oficial 2008 de USCIS
- **Patrones de Entrevista**: Curados de 20+ videos reales de YouTube
- **Formulario N-400**: Esquema oficial documentado
- **Flujos de Entrevista**: Basados en procedimientos reales

### **Política de Privacidad**
- ✅ **Procesamiento Local**: Todo se ejecuta en tu navegador
- ✅ **Sin Servidores**: No se envían datos a APIs externas
- ✅ **Sin Tracking**: No hay cookies de seguimiento
- ✅ **Borrado Seguro**: Función de limpiar todos los datos
- ✅ **GDPR Compliant**: Cumple regulaciones europeas

---

## 🎓 **Casos de Uso**

### **Para Escuelas de Inmigración**
- Herramienta premium para estudiantes
- Diferenciador competitivo único
- Valor agregado sin costo adicional

### **Para Consultores de Inmigración**
- Preparación avanzada de clientes
- Identificación de factores de riesgo
- Reducción de tiempo de consulta

### **Para Aplicantes Individuales**
- Práctica realista antes del examen
- Identificación de áreas de mejora
- Aumento de confianza y preparación

---

## 🔬 **Tecnologías Utilizadas**

### **Frontend**
- **HTML5/CSS3**: Interface responsive moderna
- **Vanilla JavaScript ES6+**: Sin dependencias externas
- **Web Speech API**: Reconocimiento y síntesis de voz
- **LocalStorage**: Persistencia de datos local

### **AI Engine**
- **Pattern Matching**: Sistema de patrones curados
- **Rule-Based Logic**: Motor de decisiones inteligente  
- **Risk Assessment**: Algoritmo de evaluación de riesgo
- **Context Awareness**: Conversación consciente del contexto

### **Data Processing**
- **JSON Parsing**: Procesamiento de N-400
- **Text Analysis**: Análisis de respuestas del usuario
- **Progress Tracking**: Seguimiento de progreso en tiempo real

---

## 📈 **Roadmap Futuro**

### **v2.0 - AI Integration**
- [ ] Integración con OpenAI GPT-4
- [ ] Procesamiento automático de PDF N-400
- [ ] Análisis de sentimiento en respuestas

### **v2.1 - Enhanced Features**
- [ ] Video simulation con avatares
- [ ] Multi-language support (más idiomas)
- [ ] Mobile app nativa (React Native)

### **v2.2 - Community Features**
- [ ] Sistema de puntuaciones y rankings
- [ ] Compartir resultados y progreso
- [ ] Foro de comunidad integrado

---

## 🤝 **Contribuir**

¡Las contribuciones son bienvenidas! 

### **Cómo Contribuir**
1. **Fork** el repositorio
2. Crea una **branch** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la branch (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### **Tipos de Contribuciones Necesarias**
- 🐛 **Bug Reports**: Reportar errores o problemas
- ✨ **Features**: Nuevas funcionalidades
- 📚 **Documentación**: Mejorar README y docs
- 🌍 **Traducciones**: Más idiomas
- 🎨 **UI/UX**: Mejoras de interfaz
- 📊 **Data**: Más patrones de entrevista

---

## 📝 **Changelog**

### **v1.0.0** (2024-01-15)
- ✅ Lanzamiento inicial
- ✅ 100 preguntas cívicas oficiales EN/ES
- ✅ Motor AI con patrones curados
- ✅ Interface responsive completa
- ✅ Voice input/output
- ✅ N-400 integration básica
- ✅ 7 fases de entrevista realista

---

## ⚖️ **Licencia**

Este proyecto está bajo la **MIT License** - ver el archivo [LICENSE](LICENSE) para detalles.

### **Uso Comercial**
- ✅ Uso libre para proyectos comerciales
- ✅ Modificación y distribución permitidas
- ✅ Sin restricciones de uso

### **Atribución**
Si usas este proyecto, por favor considera:
- ⭐ Dar una **estrella** al repositorio
- 🔗 **Enlazar** de vuelta a este proyecto
- 📧 **Compartir** tus casos de uso exitosos

---

## 🙏 **Créditos y Reconocimientos**

### **Datos Oficiales**
- **USCIS**: Por las 100 preguntas cívicas oficiales
- **U.S. Government**: Por el formulario N-400 de dominio público

### **Inspiración**
- **Videos de YouTube**: Creadores que comparten entrevistas reales
- **Comunidad de Inmigración**: Por feedback y casos de uso reales

### **Tecnología**
- **Web Speech API**: Mozilla Foundation
- **GitHub Pages**: Por hosting gratuito
- **Open Source Community**: Por herramientas y librerías

---

## 📞 **Soporte y Contacto**

### **¿Necesitas Ayuda?**
- 📖 **Documentación**: Lee este README completo
- 🐛 **Bug Reports**: Crea un [Issue](https://github.com/tu-usuario/uscis-interview-tool/issues)
- 💬 **Discusiones**: Usa [Discussions](https://github.com/tu-usuario/uscis-interview-tool/discussions)
- 📧 **Contacto Directo**: [tu-email@ejemplo.com]

### **Para Integraciones Comerciales**
- 🏢 **Escuelas**: Consulta sobre implementación personalizada
- 💼 **Consultores**: Licencias comerciales disponibles
- 🤝 **Partners**: Oportunidades de colaboración

---

## 🌟 **¿Te Gusta el Proyecto?**

Si este proyecto te ha sido útil:

- ⭐ **Dale una estrella** en GitHub
- 🔄 **Compártelo** con otros
- 💬 **Deja un review** en Discussions
- 🤝 **Contribuye** al desarrollo

**¡Juntos podemos ayudar a más personas a lograr la ciudadanía estadounidense!** 🇺🇸

---

<div align="center">

**Hecho con ❤️ para la comunidad de inmigración**

**[⬆ Volver al inicio](#-uscis-naturalization-interview-practice-tool)**

</div>
