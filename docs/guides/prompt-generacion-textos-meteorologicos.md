# Guía: Generación de Textos Meteorológicos para el Parser

Esta guía explica cómo generar textos meteorológicos en español que serán procesados automáticamente por el sistema de parsing y convertidos en vídeos. Está diseñada para ser usada con agentes de IA (como Groq, GPT, Claude, etc.) que generen los textos de entrada.

## Objetivo

Generar descripciones meteorológicas en español que sean:
- **Naturales y legibles** para humanos
- **Parseables automáticamente** por el sistema
- **Completas** con toda la información disponible
- **Estructuradas** siguiendo patrones reconocibles

## Formato Base Requerido

El texto debe seguir esta estructura general:

```
Hoy en [CIUDAD][, [PAÍS]]: [condición meteorológica], con [detalles adicionales], temperaturas [rango o valor], y [información de viento][, precipitación si hay].
```

## Campos Obligatorios

### 1. Ubicación

**Formato:**
- `Hoy en [Ciudad]`
- `Hoy en [Ciudad], [País]`

**Ejemplos:**
- `Hoy en Madrid`
- `Hoy en New York, Estados Unidos`
- `Hoy en Barcelona, España`

**Nota:** El parser busca el patrón `en [Ciudad]` o `[Ciudad], [País]:` al inicio del texto.

### 2. Condición Meteorológica Principal

**Términos reconocidos:**
- `cielo despejado` / `despejado` → "Despejado"
- `soleado` / `sol` → "Soleado"
- `nublado` / `nubes` → "Nublado"
- `muy nublado` / `cielo cubierto` → "Muy nublado"
- `lluvia` / `lluvioso` / `chubascos` → "Lluvia"
- `nieve` / `nevando` → "Nieve"
- `tormenta` / `tormentoso` → "Tormenta"

**Ejemplos:**
- `cielo despejado`
- `muy nublado`
- `posibilidad de lluvia débil`

### 3. Temperaturas (OBLIGATORIO)

El parser reconoce tres formatos principales:

#### Opción A: Rango Mañana/Tarde (RECOMENDADO)

**Formato:**
```
temperaturas alrededor de [X]°C por la mañana y subiendo hasta cerca de [Y]°C por la tarde
```

**Variaciones aceptadas:**
- `temperaturas alrededor de [X]°C por la mañana y subiendo hasta cerca de [Y]°C por la tarde`
- `temperaturas de [X]°C por la mañana y hasta [Y]°C por la tarde`
- `temperaturas alrededor de [X]°C por mañana y subiendo hasta [Y]°C por tarde`

**Ejemplos:**
- `temperaturas alrededor de -4°C por la mañana y subiendo hasta cerca de -1°C por la tarde`
- `temperaturas de 10°C por la mañana y hasta 13°C por la tarde`

**Ventaja:** Este formato permite mostrar el rango completo en el video.

#### Opción B: Rango Simple

**Formato:**
```
temperaturas entre [X]°C y [Y]°C
```

**Variaciones:**
- `temperaturas entre [X]°C y [Y]°C`
- `temperaturas de [X]°C a [Y]°C`

**Ejemplos:**
- `temperaturas entre 1°C y 8°C`
- `temperaturas de 10°C a 15°C`

#### Opción C: Temperatura Única

**Formato:**
```
temperatura de [X]°C
```
o simplemente:
```
[X]°C
```

**Ejemplos:**
- `temperatura de 25°C`
- `25°C`

**Nota:** Si solo hay una temperatura, el video mostrará ese valor único.

### 4. Viento (RECOMENDADO)

El parser extrae dirección, intensidad y velocidad del viento.

#### Con Dirección e Intensidad

**Formato:**
```
viento del [dirección] [intensidad]
```

**Direcciones reconocidas:**
- `norte`, `sur`, `este`, `oeste`
- `noreste`, `noroeste`, `sureste`, `suroeste`
- `nordeste` (alternativa a noreste)

**Intensidades reconocidas:**
- `flojo` / `débil` / `leve` / `ligero` / `suave` → "débil"
- `moderado` / `medio` → "moderado"
- `fuerte` / `intenso` / `severo` → "fuerte"

**Ejemplos:**
- `viento del norte flojo`
- `viento del sur moderado`
- `viento del noreste fuerte`

#### Con Velocidad

**Formato:**
```
viento de [X] km/h [dirección opcional]
```

**Unidades:**
- `km/h` o `kmh` (por defecto)
- `mph` o `millas` (si se especifica)

**Ejemplos:**
- `viento de 18 km/h del norte`
- `viento de 25 km/h`
- `viento de 15 mph del sur`

#### Solo Intensidad

**Formato:**
```
viento [intensidad]
```

**Ejemplos:**
- `viento moderado`
- `viento fuerte`
- `viento flojo`

## Campos Opcionales

### 5. Precipitación

**Tipos reconocidos:**
- `lluvia` / `chubascos` → tipo "rain"
- `nieve` / `nevando` → tipo "snow"
- `tormenta` / `tormenta eléctrica` → tipo "storm"

**Intensidades:**
- `débil` / `leve` / `ligero` / `suave`
- `moderado` / `medio`
- `fuerte` / `intenso` / `severo`

**Probabilidades:**
- Porcentaje explícito: `60%`, `75%`
- Texto descriptivo:
  - `alta probabilidad` / `muy probable` → 75%
  - `baja probabilidad` / `poco probable` → 25%
  - `probabilidad media` / `probable` → 50%

**Ejemplos:**
- `posibilidad de lluvia débil`
- `lluvia moderada con 60% de probabilidad`
- `alta probabilidad de precipitación`
- `chubascos débiles`

### 6. Sensación Térmica

**Formato:**
```
sensación térmica de [X]°C
```
o
```
se siente como [X]°C
```

**Ejemplos:**
- `sensación térmica de 2°C`
- `se siente como -5°C`

**Nota:** Si se incluye, aparecerá como una tarjeta adicional en el video.

## Ejemplos Completos

### Ejemplo 1: Texto Completo (Recomendado)

```
Hoy en New York: cielo despejado, con temperaturas alrededor de -4°C por la mañana y subiendo hasta cerca de -1°C por la tarde, y viento del norte flojo a lo largo del día.
```

**Elementos extraídos:**
- Ciudad: "New York"
- Condición: "Despejado"
- Rango de temperaturas: -4°C a -1°C
- Viento: "Viento flojo" + dirección "Norte"

### Ejemplo 2: Con Precipitación

```
Hoy en Torrejón de Ardoz: posibilidad de lluvia débil, con temperaturas alrededor de 8°C por la mañana y subiendo hasta cerca de 11°C por la tarde, y viento del norte flojo.
```

**Elementos extraídos:**
- Ciudad: "Torrejón de Ardoz"
- Condición: "Lluvia" (inferida de "posibilidad de lluvia")
- Rango de temperaturas: 8°C a 11°C
- Viento: "Viento flojo" + dirección "Norte"
- Precipitación: tipo "rain", intensidad "débil"

### Ejemplo 3: Con Rango Simple

```
Hoy en Madrid, España: muy nublado, con chubascos débiles, temperaturas entre 1°C y 8°C y viento moderado, con alta probabilidad de precipitación.
```

**Elementos extraídos:**
- Ciudad: "Madrid"
- País: "España"
- Condición: "Muy nublado"
- Rango de temperaturas: 1°C a 8°C
- Viento: "Viento moderado"
- Precipitación: tipo "rain", intensidad "débil", probabilidad 75%

### Ejemplo 4: Mínimo Requerido

```
Hoy en Barcelona: soleado, con temperaturas alrededor de 20°C por la mañana y subiendo hasta cerca de 25°C por la tarde.
```

**Elementos extraídos:**
- Ciudad: "Barcelona"
- Condición: "Soleado"
- Rango de temperaturas: 20°C a 25°C

## Reglas de Generación

### Obligatorias

1. **SIEMPRE incluye ubicación y temperatura** - Son campos obligatorios
2. **Usa el formato de rango mañana/tarde cuando sea posible** - Mejor experiencia visual en el video
3. **Sé específico con las temperaturas** - Usa números exactos, no aproximaciones vagas
4. **Incluye viento cuando sea relevante** - Especialmente si hay dirección o intensidad notable

### Recomendadas

5. **Mantén el texto natural** - No suenes robótico, pero sigue los patrones
6. **Longitud adecuada** - Entre 50 y 200 caracteres aproximadamente
7. **Unidades consistentes** - Usa °C por defecto (o °F si se especifica)
8. **Orden sugerido** - Ubicación → Condición → Temperaturas → Viento → Precipitación

### Estructura Sugerida

```
[Hoy en] [Ciudad][, [País]]: [condición], [con] [detalles], temperaturas [formato], [y] [viento][, precipitación][, sensación térmica].
```

## Prompt Completo para Agentes de IA

### Prompt Profesional para Generación de Textos Meteorológicos

Este es el prompt completo y optimizado para usar con cualquier agente de IA (Groq, GPT-4, Claude, etc.) que genere textos meteorológicos desde datos estructurados:

```
Eres un experto en meteorología y generación de textos en español. Tu tarea es convertir datos meteorológicos estructurados en descripciones naturales, completas y parseables automáticamente.

## CONTEXTO

Los textos que generes serán procesados por un sistema de parsing automático que extrae información específica usando patrones regex. Por tanto, DEBES seguir formatos exactos mientras mantienes naturalidad.

## FORMATO REQUERIDO

El texto debe seguir esta estructura exacta:

"Hoy en [CIUDAD][, [PAÍS]]: [condición meteorológica], con temperaturas alrededor de [TEMP_MIN]°C por la mañana y subiendo hasta cerca de [TEMP_MAX]°C por la tarde, y [viento si disponible][, precipitación si hay]."

## DATOS DE ENTRADA

Recibirás datos en este formato exacto:

- Día de hoy: {{ $json.date }}
- Ciudad: {{ $json.location.name }}
- Temperatura: {{ $json.current.tempC }}
- Se siente como: {{ $json.current.feelsLikeC }}
- Temperatura mínima: {{ $json.current.tempMinC }}
- Temperatura máxima: {{ $json.current.tempMaxC }}
- Lluvia en 1 hora: {{ $json.current.rain1hMm }}
- Presión atmosférica: {{ $json.current.pressureHpa }}
- Descripción tiempo: {{ $json.current.weatherDesc }}
- Mensaje: {{ $json.events[0].message }}
- Velocidad del viento: {{ $json.current.windMs }} (en metros por segundo, m/s)
- Dirección del viento: {{ $json.current.windDeg }} (en grados, 0-360)

## REGLAS DE TRANSFORMACIÓN

### 1. UBICACIÓN (OBLIGATORIO)
- Usa: "Hoy en [CIUDAD]"
- Si hay país: "Hoy en [CIUDAD], [PAÍS]"
- Capitaliza correctamente: primera letra mayúscula
- Ejemplos: "Hoy en Madrid", "Hoy en New York, Estados Unidos"

### 2. CONDICIÓN METEOROLÓGICA (OBLIGATORIO)

Traduce {{ $json.current.weatherDesc }} usando esta tabla:

| Valor API | Traducción al Español |
|-----------|----------------------|
| "clear sky", "sunny", "mostly sunny" | "cielo despejado" o "soleado" |
| "partly cloudy", "partially cloudy" | "parcialmente nublado" o "nublado" |
| "cloudy", "mostly cloudy" | "nublado" |
| "overcast", "cloudy skies" | "muy nublado" |
| "light rain", "drizzle", "light drizzle" | "lluvia débil" o "chubascos" |
| "rain", "moderate rain" | "lluvia" |
| "heavy rain", "rain showers" | "lluvia fuerte" |
| "light snow", "snow" | "nieve débil" o "nieve" |
| "heavy snow", "snow showers" | "nieve fuerte" |
| "thunderstorm", "thunderstorm with rain" | "tormenta" |
| "fog", "mist", "haze" | "niebla" o "neblina" |

**IMPORTANTE:** Si el texto contiene "posibilidad de" o "chance of", usa "posibilidad de [condición]"

### 3. TEMPERATURAS (OBLIGATORIO)

**Formato exacto requerido:**
"temperaturas alrededor de [TEMP_MIN]°C por la mañana y subiendo hasta cerca de [TEMP_MAX]°C por la tarde"

**Mapeo de datos:**
- TEMP_MIN = {{ $json.current.tempMinC }} (redondea a entero)
- TEMP_MAX = {{ $json.current.tempMaxC }} (redondea a entero)

**Variaciones aceptadas:**
- "temperaturas de [TEMP_MIN]°C por la mañana y hasta [TEMP_MAX]°C por la tarde"
- "temperaturas alrededor de [TEMP_MIN]°C por mañana y subiendo hasta [TEMP_MAX]°C por tarde"

**Si solo hay una temperatura:**
- Usa: "temperatura de [TEMP]°C" o simplemente "[TEMP]°C"

**Manejo de negativos:**
- Escribe: "-4°C" (con guión pegado al número)
- NO escribas: "- 4°C" (con espacio)

### 4. PRECIPITACIÓN (OPCIONAL pero RECOMENDADO si hay lluvia)

**Mapeo de {{ $json.current.rain1hMm }}:**

| Rango (mm) | Descripción |
|------------|-------------|
| 0 - 0.5 | "posibilidad de lluvia débil" |
| 0.5 - 2 | "lluvia débil" |
| 2 - 5 | "lluvia moderada" |
| 5 - 10 | "lluvia fuerte" |
| > 10 | "lluvia intensa" |

**REGLA CRÍTICA - Evitar Redundancia:**

**NO repitas la precipitación si ya está en la condición meteorológica.**

- Si la condición ya es "lluvia", "lluvia débil", "lluvia fuerte", "chubascos", etc. → **NO añadas precipitación adicional**
- Solo añade precipitación si:
  - La condición NO menciona lluvia/nieve/tormenta (ej: condición es "nublado" pero hay lluvia)
  - O si necesitas especificar probabilidad adicional (ej: "alta probabilidad de lluvia")
  - O si la intensidad de la precipitación es diferente a la condición

**Ejemplos correctos:**
- Condición: "lluvia fuerte" + rain1hMm: 8mm → **NO añadas** ", y lluvia fuerte" (ya está en la condición)
- Condición: "nublado" + rain1hMm: 3mm → **SÍ añade** ", y lluvia moderada"
- Condición: "lluvia" + rain1hMm: 0.3mm → **SÍ añade** ", y posibilidad de lluvia débil" (especifica probabilidad)

**Formato en el texto (solo si aplica):**
- Si hay lluvia y NO está en la condición: añade ", y [descripción]" después de las temperaturas
- Ejemplo: ", y lluvia moderada"

**Si hay {{ $json.events[0].message }}:**
- Inclúyelo si es relevante (avisos, alertas)
- Integra naturalmente en el texto

### 5. VIENTO (OPCIONAL pero RECOMENDADO)

**Si hay {{ $json.current.windMs }} y/o {{ $json.current.windDeg }}:**

**CONVERSIÓN DE VELOCIDAD:**
- {{ $json.current.windMs }} está en **metros por segundo (m/s)**
- **DEBES convertir a km/h**: multiplica por 3.6
- Fórmula: `velocidad_kmh = {{ $json.current.windMs }} * 3.6`
- Redondea a entero: `Math.round({{ $json.current.windMs }} * 3.6)`

**CONVERSIÓN DE DIRECCIÓN:**
- {{ $json.current.windDeg }} está en **grados (0-360)**
- **DEBES convertir a dirección cardinal** usando esta tabla:

| Grados | Dirección | Traducción |
|--------|-----------|------------|
| 0-22.5 o 337.5-360 | N | "norte" |
| 22.5-67.5 | NE | "noreste" |
| 67.5-112.5 | E | "este" |
| 112.5-157.5 | SE | "sureste" |
| 157.5-202.5 | S | "sur" |
| 202.5-247.5 | SW | "suroeste" |
| 247.5-292.5 | W | "oeste" |
| 292.5-337.5 | NW | "noroeste" |

**Algoritmo de conversión:**
```
Si windDeg está entre:
- 0-22.5 o 337.5-360 → "norte"
- 22.5-67.5 → "noreste"
- 67.5-112.5 → "este"
- 112.5-157.5 → "sureste"
- 157.5-202.5 → "sur"
- 202.5-247.5 → "suroeste"
- 247.5-292.5 → "oeste"
- 292.5-337.5 → "noroeste"
```

**Formato en el texto:**
- Con velocidad y dirección: "viento de [VELOCIDAD_KMH] km/h del [DIRECCIÓN]"
- Solo velocidad: "viento de [VELOCIDAD_KMH] km/h"
- Solo dirección e intensidad: "viento del [DIRECCIÓN] [INTENSIDAD]"

**Intensidad basada en velocidad (km/h):**
- 0-15 km/h → "flojo" o "débil"
- 15-30 km/h → "moderado"
- >30 km/h → "fuerte"

**Ejemplos de conversión:**
- windMs: 5 m/s → 5 * 3.6 = 18 km/h
- windDeg: 45° → "noreste"
- windDeg: 180° → "sur"
- windDeg: 270° → "oeste"
- windDeg: 350° → "norte"

**Ejemplos en el texto:**
- "viento de 18 km/h del norte" (windMs: 5, windDeg: 0)
- "viento de 25 km/h del noreste" (windMs: 7, windDeg: 45)
- "viento de 10 km/h" (solo velocidad, sin dirección)

### 6. SENSACIÓN TÉRMICA (OPCIONAL)

Solo incluye si {{ $json.current.feelsLikeC }} difiere significativamente (más de 3°C) de {{ $json.current.tempC }}:

- Formato: "sensación térmica de [FEELS_LIKE]°C"
- Añade al final: ", con sensación térmica de [FEELS_LIKE]°C"

## ESTRUCTURA DEL TEXTO FINAL

**Orden sugerido:**
1. Ubicación
2. Condición meteorológica
3. Temperaturas (rango mañana/tarde)
4. Precipitación (si hay)
5. Viento (si hay)
6. Sensación térmica (si es relevante)

**Longitud:** Entre 50 y 200 caracteres aproximadamente

**Tono:** Natural, informativo, sin ser robótico

## EJEMPLOS COMPLETOS

### Ejemplo 1: Datos completos
**Entrada:**
- Ciudad: "Madrid"
- TempMinC: 10
- TempMaxC: 18
- WeatherDesc: "partly cloudy"
- Rain1hMm: 3.5
- WindMs: 4.2 (m/s)
- WindDeg: 45 (grados)

**Cálculos:**
- Velocidad: 4.2 m/s * 3.6 = 15.12 km/h → 15 km/h (redondeado)
- Dirección: 45° → "noreste"

**Salida:**
"Hoy en Madrid: parcialmente nublado, con temperaturas alrededor de 10°C por la mañana y subiendo hasta cerca de 18°C por la tarde, y lluvia moderada, con viento de 15 km/h del noreste."

**Nota:** Como la condición es "parcialmente nublado" (no menciona lluvia), SÍ se añade la precipitación.

### Ejemplo 1b: Condición ya incluye lluvia (EVITAR REDUNDANCIA)
**Entrada:**
- Ciudad: "Madrid"
- TempMinC: 7
- TempMaxC: 10
- WeatherDesc: "heavy rain"
- Rain1hMm: 8
- WindMs: 2.2 (m/s)
- WindDeg: 180 (grados)

**Cálculos:**
- Velocidad: 2.2 m/s * 3.6 = 7.92 km/h → 8 km/h (redondeado)
- Dirección: 180° → "sur"

**Salida CORRECTA:**
"Hoy en Madrid: lluvia fuerte, con temperaturas alrededor de 7°C por la mañana y subiendo hasta cerca de 10°C por la tarde, y viento de 8 km/h del sur."

**Salida INCORRECTA (redundante):**
"Hoy en Madrid: lluvia fuerte, con temperaturas alrededor de 7°C por la mañana y subiendo hasta cerca de 10°C por la tarde, y lluvia fuerte, viento de 8 km/h del sur."

**Explicación:** La condición ya dice "lluvia fuerte", NO repitas la precipitación.

### Ejemplo 2: Sin precipitación
**Entrada:**
- Ciudad: "Barcelona"
- TempMinC: 15
- TempMaxC: 22
- WeatherDesc: "clear sky"
- WindMs: 3.3 (m/s)
- WindDeg: 180 (grados)

**Cálculos:**
- Velocidad: 3.3 m/s * 3.6 = 11.88 km/h → 12 km/h (redondeado)
- Dirección: 180° → "sur"

**Salida:**
"Hoy en Barcelona: cielo despejado, con temperaturas alrededor de 15°C por la mañana y subiendo hasta cerca de 22°C por la tarde, y viento de 12 km/h del sur."

### Ejemplo 3: Con temperatura negativa
**Entrada:**
- Ciudad: "New York"
- TempMinC: -4
- TempMaxC: -1
- WeatherDesc: "clear sky"
- WindMs: 2.2 (m/s)
- WindDeg: 0 (grados)

**Cálculos:**
- Velocidad: 2.2 m/s * 3.6 = 7.92 km/h → 8 km/h (redondeado)
- Dirección: 0° → "norte"

**Salida:**
"Hoy en New York: cielo despejado, con temperaturas alrededor de -4°C por la mañana y subiendo hasta cerca de -1°C por la tarde, y viento de 8 km/h del norte."

### Ejemplo 4: Mínimo requerido
**Entrada:**
- Ciudad: "Valencia"
- TempMinC: 20
- TempMaxC: 25
- WeatherDesc: "sunny"

**Salida:**
"Hoy en Valencia: soleado, con temperaturas alrededor de 20°C por la mañana y subiendo hasta cerca de 25°C por la tarde."

## REGLAS CRÍTICAS

1. **SIEMPRE incluye ubicación y temperaturas** - Son obligatorios
2. **Usa el formato exacto de rango mañana/tarde** - Es el mejor para el video
3. **Redondea temperaturas a enteros** - No uses decimales
4. **Mantén el orden sugerido** - Facilita el parsing
5. **Sé consistente con las traducciones** - Usa la tabla de condiciones
6. **NO repitas información** - Si la condición ya dice "lluvia fuerte", NO añadas ", y lluvia fuerte" de nuevo
7. **No añadas información no solicitada** - Solo lo que está en los datos
8. **Mantén naturalidad** - No suenes robótico
9. **Termina con punto** - Cierra la frase correctamente

## VALIDACIÓN

Antes de generar el texto final, verifica:
- ✅ Tiene ubicación
- ✅ Tiene condición meteorológica traducida correctamente
- ✅ Tiene rango de temperaturas en formato mañana/tarde
- ✅ Temperaturas redondeadas a enteros
- ✅ Precipitación incluida SOLO si:
  - rain1hMm > 0 Y la condición NO menciona lluvia/nieve/tormenta
  - O si necesitas especificar probabilidad/intensidad adicional
- ✅ NO hay redundancia (no repites "lluvia" si ya está en la condición)
- ✅ Viento incluido si hay datos disponibles
- ✅ Longitud entre 50-200 caracteres
- ✅ Termina con punto

## OUTPUT

Genera SOLO el texto meteorológico en español, sin explicaciones, sin formato markdown, sin comillas adicionales, sin código. Solo el texto plano listo para ser parseado.

Ejemplo de output correcto:
Hoy en Madrid: parcialmente nublado, con temperaturas alrededor de 10°C por la mañana y subiendo hasta cerca de 18°C por la tarde, y lluvia moderada, con viento de 15 km/h del noreste.

Ejemplo de output incorrecto:
```json
{
  "text": "Hoy en Madrid: ..."
}
```
```

## Versión para Datos Estructurados (API Meteorológica)

Si tienes datos estructurados de una API meteorológica con estos campos:

```
Ciudad: {{ $json.location.name }}
Temperatura actual: {{ $json.current.tempC }}
Sensación térmica: {{ $json.current.feelsLikeC }}
Temperatura mínima: {{ $json.current.tempMinC }}
Temperatura máxima: {{ $json.current.tempMaxC }}
Lluvia en 1 hora: {{ $json.current.rain1hMm }}
Presión atmosférica: {{ $json.current.pressureHpa }}
Descripción tiempo: {{ $json.current.weatherDesc }}
Mensaje: {{ $json.events[0].message }}
Día: {{ $json.date }}
```

**Prompt adaptado:**

```
Convierte estos datos meteorológicos en un texto natural en español siguiendo este formato:

"Hoy en [CIUDAD]: [condición], con temperaturas alrededor de [TEMP_MIN]°C por la mañana y subiendo hasta cerca de [TEMP_MAX]°C por la tarde, y [viento si disponible][, precipitación si hay]."

INSTRUCCIONES:
1. Ubicación: Usa {{ $json.location.name }} como ciudad
2. Condición: Convierte {{ $json.current.weatherDesc }} a términos reconocibles:
   - "clear sky" / "sunny" → "cielo despejado" o "soleado"
   - "partly cloudy" → "parcialmente nublado" o "nublado"
   - "cloudy" / "overcast" → "muy nublado"
   - "rain" / "drizzle" → "lluvia" o "chubascos"
   - "snow" → "nieve"
   - "thunderstorm" → "tormenta"
3. Temperaturas: 
   - Usa {{ $json.current.tempMinC }} como temperatura de mañana
   - Usa {{ $json.current.tempMaxC }} como temperatura de tarde
   - Formato: "temperaturas alrededor de [TEMP_MIN]°C por la mañana y subiendo hasta cerca de [TEMP_MAX]°C por la tarde"
4. Precipitación:
   - Si {{ $json.current.rain1hMm }} > 0:
     - 0-2mm → "posibilidad de lluvia débil"
     - 2-5mm → "lluvia débil"
     - 5-10mm → "lluvia moderada"
     - >10mm → "lluvia fuerte"
   - Si hay mensaje en {{ $json.events[0].message }}, inclúyelo si es relevante
5. Viento: Si hay información de viento en los datos, inclúyela
6. Sensación térmica: Opcional, solo si {{ $json.current.feelsLikeC }} difiere significativamente de {{ $json.current.tempC }}

EJEMPLO DE SALIDA:
"Hoy en Madrid: cielo despejado, con temperaturas alrededor de 10°C por la mañana y subiendo hasta cerca de 18°C por la tarde, y viento moderado del noreste."

Genera SOLO el texto meteorológico, sin explicaciones adicionales.
```

### Plantilla Directa (Sin IA)

Si prefieres generar el texto directamente sin usar IA, aquí tienes una plantilla:

**Para n8n, Make, Zapier, etc.:**

```
Hoy en {{ $json.location.name }}: {{ $json.current.weatherDesc }}, con temperaturas alrededor de {{ $json.current.tempMinC }}°C por la mañana y subiendo hasta cerca de {{ $json.current.tempMaxC }}°C por la tarde{{ $json.current.rain1hMm > 0 ? ', y ' + ({{ $json.current.rain1hMm }} < 2 ? 'posibilidad de lluvia débil' : {{ $json.current.rain1hMm }} < 5 ? 'lluvia débil' : {{ $json.current.rain1hMm }} < 10 ? 'lluvia moderada' : 'lluvia fuerte') : '' }}.
```

**Versión más simple (JavaScript/Node.js):**

```javascript
function generateWeatherText(data) {
  const city = data.location.name;
  const condition = translateCondition(data.current.weatherDesc);
  const tempMin = data.current.tempMinC;
  const tempMax = data.current.tempMaxC;
  const rain = data.current.rain1hMm;
  
  let text = `Hoy en ${city}: ${condition}, con temperaturas alrededor de ${tempMin}°C por la mañana y subiendo hasta cerca de ${tempMax}°C por la tarde`;
  
  if (rain > 0) {
    let rainDesc = '';
    if (rain < 2) rainDesc = 'posibilidad de lluvia débil';
    else if (rain < 5) rainDesc = 'lluvia débil';
    else if (rain < 10) rainDesc = 'lluvia moderada';
    else rainDesc = 'lluvia fuerte';
    text += `, y ${rainDesc}`;
  }
  
  text += '.';
  return text;
}

function translateCondition(desc) {
  const conditions = {
    'clear sky': 'cielo despejado',
    'sunny': 'soleado',
    'partly cloudy': 'parcialmente nublado',
    'cloudy': 'nublado',
    'overcast': 'muy nublado',
    'rain': 'lluvia',
    'drizzle': 'chubascos',
    'snow': 'nieve',
    'thunderstorm': 'tormenta'
  };
  return conditions[desc.toLowerCase()] || desc;
}
```

## Patrones que el Parser NO Reconoce

Evita estos formatos que pueden causar problemas:

❌ **Evitar:**
- `Temperatura máxima: 25°C, mínima: 15°C` (no usa el patrón mañana/tarde)
- `Viento: 15-20 km/h` (rango de velocidad no soportado)
- `Probabilidad de lluvia: alta` (prefiere porcentaje o "alta probabilidad")
- `Condiciones: soleado con nubes dispersas` (usa términos simples)

✅ **Usar:**
- `temperaturas alrededor de 15°C por la mañana y subiendo hasta cerca de 25°C por la tarde`
- `viento de 18 km/h del norte`
- `alta probabilidad de lluvia` o `lluvia con 75% de probabilidad`
- `soleado` o `parcialmente nublado`

## Validación y Testing

Antes de usar un texto en producción, verifica que:

1. **Tiene ubicación** - El parser debe extraer ciudad (y país si está)
2. **Tiene temperatura** - Debe extraer al menos una temperatura
3. **Tiene condición** - Debe reconocer la condición meteorológica
4. **Formato correcto** - Sigue los patrones reconocidos

### Test Rápido

Puedes probar el parsing con un curl:

```bash
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d '{
    "text": "TU TEXTO AQUÍ"
  }' \
  --output test-video.mp4
```

Revisa los logs del servidor para ver qué datos se extrajeron del texto.

## Troubleshooting

### El rango de temperaturas no aparece

**Problema:** El video no muestra la tarjeta de rango.

**Solución:**
- Asegúrate de usar el formato exacto: `temperaturas alrededor de X°C por la mañana y subiendo hasta cerca de Y°C por la tarde`
- Verifica que los números sean negativos si es necesario: `-4°C` no `- 4°C`
- Revisa los logs del servidor para ver si el parser detectó el rango

### El viento no muestra la dirección

**Problema:** Solo aparece "Viento" sin dirección.

**Solución:**
- Usa el formato: `viento del [dirección] [intensidad]`
- Asegúrate de usar direcciones reconocidas: `norte`, `sur`, `este`, `oeste`, etc.
- Si hay velocidad, inclúyela: `viento de 18 km/h del norte`

### La condición no se reconoce

**Problema:** Aparece "Despejado" por defecto en lugar de la condición real.

**Solución:**
- Usa términos del diccionario: `soleado`, `nublado`, `muy nublado`, `lluvia`, `nieve`, `tormenta`
- Evita términos muy específicos o técnicos
- Si hay múltiples condiciones, usa la principal primero

## Integración con APIs Meteorológicas

### Mapeo de Campos Comunes

Si estás integrando con una API meteorológica, aquí tienes el mapeo de campos comunes:

| Campo API | Campo Parser | Formato Requerido |
|-----------|--------------|-------------------|
| `location.name` | Ciudad | Texto directo |
| `current.tempC` | Temperatura actual | Número |
| `current.tempMinC` | Temp. mínima (mañana) | Número |
| `current.tempMaxC` | Temp. máxima (tarde) | Número |
| `current.feelsLikeC` | Sensación térmica | Número (opcional) |
| `current.weatherDesc` | Condición | Traducir a términos reconocibles |
| `current.rain1hMm` | Precipitación | 0-2mm: débil, 2-5mm: débil, 5-10mm: moderada, >10mm: fuerte |
| `current.windMs` | Velocidad viento | Convertir m/s a km/h (multiplicar por 3.6) |
| `current.windDeg` | Dirección viento | Convertir grados (0-360) a dirección cardinal |
| `events[0].message` | Mensaje eventos | Texto (opcional) |
| `date` | Fecha | Texto (opcional, no se usa en el texto final) |

### Ejemplo de Transformación

**Datos de entrada:**
```json
{
  "location": { "name": "Madrid" },
  "current": {
    "tempC": 14,
    "tempMinC": 10,
    "tempMaxC": 18,
    "feelsLikeC": 12,
    "weatherDesc": "partly cloudy",
    "rain1hMm": 3.5,
    "windMs": 4.2,
    "windDeg": 45
  }
}
```

**Cálculos necesarios:**
- Velocidad viento: 4.2 m/s * 3.6 = 15.12 km/h → 15 km/h
- Dirección viento: 45° → "noreste"

**Texto generado:**
```
Hoy en Madrid: parcialmente nublado, con temperaturas alrededor de 10°C por la mañana y subiendo hasta cerca de 18°C por la tarde, y lluvia débil con viento de 15 km/h del noreste.
```

### Función de Traducción de Condiciones

```javascript
function translateWeatherCondition(apiCondition) {
  const translations = {
    // Condiciones claras
    'clear sky': 'cielo despejado',
    'sunny': 'soleado',
    'mostly sunny': 'mayormente soleado',
    
    // Condiciones nubladas
    'partly cloudy': 'parcialmente nublado',
    'cloudy': 'nublado',
    'mostly cloudy': 'mayormente nublado',
    'overcast': 'muy nublado',
    
    // Precipitación
    'light rain': 'lluvia débil',
    'rain': 'lluvia',
    'heavy rain': 'lluvia fuerte',
    'drizzle': 'chubascos',
    'showers': 'chubascos',
    
    // Nieve
    'light snow': 'nieve débil',
    'snow': 'nieve',
    'heavy snow': 'nieve fuerte',
    
    // Tormentas
    'thunderstorm': 'tormenta',
    'thunderstorm with rain': 'tormenta con lluvia',
    
    // Otros
    'fog': 'niebla',
    'mist': 'neblina',
    'haze': 'calima'
  };
  
  const normalized = apiCondition.toLowerCase().trim();
  return translations[normalized] || apiCondition;
}
```

### Función de Intensidad de Lluvia

```javascript
function getRainIntensity(rainMm) {
  if (rainMm === 0) return null;
  if (rainMm < 0.5) return 'posibilidad de lluvia débil';
  if (rainMm < 2) return 'lluvia débil';
  if (rainMm < 5) return 'lluvia moderada';
  if (rainMm < 10) return 'lluvia fuerte';
  return 'lluvia intensa';
}
```

### Función de Dirección de Viento

```javascript
function translateWindDirection(direction) {
  const directions = {
    'N': 'norte',
    'S': 'sur',
    'E': 'este',
    'W': 'oeste',
    'NE': 'noreste',
    'NW': 'noroeste',
    'SE': 'sureste',
    'SW': 'suroeste',
    'NNE': 'noreste',
    'NNW': 'noroeste',
    'SSE': 'sureste',
    'SSW': 'suroeste',
    'ENE': 'este',
    'ESE': 'este',
    'WNW': 'oeste',
    'WSW': 'oeste'
  };
  
  return directions[direction.toUpperCase()] || direction.toLowerCase();
}
```

## Ejemplo Completo: Integración con n8n/Make

### Escenario

Tienes un workflow que obtiene datos meteorológicos de una API y necesitas generar el texto para el video.

### Datos de Entrada

```json
{
  "location": {
    "name": "Madrid"
  },
  "current": {
    "tempC": 14,
    "tempMinC": 10,
    "tempMaxC": 18,
    "feelsLikeC": 12,
    "rain1hMm": 3.5,
    "pressureHpa": 1013,
    "weatherDesc": "partly cloudy",
    "windSpeed": 15,
    "windDirection": "NE"
  },
  "events": [
    {
      "message": "Aviso por lluvia moderada"
    }
  ],
  "date": "2026-01-27"
}
```

### Código JavaScript (n8n Function Node)

```javascript
// Obtener datos
const data = $input.item.json;

// Traducir condición
function translateCondition(desc) {
  const map = {
    'clear sky': 'cielo despejado',
    'sunny': 'soleado',
    'partly cloudy': 'parcialmente nublado',
    'cloudy': 'nublado',
    'overcast': 'muy nublado',
    'light rain': 'lluvia débil',
    'rain': 'lluvia',
    'heavy rain': 'lluvia fuerte',
    'drizzle': 'chubascos',
    'snow': 'nieve',
    'thunderstorm': 'tormenta'
  };
  return map[desc.toLowerCase()] || desc;
}

// Obtener intensidad de lluvia
function getRainIntensity(rainMm) {
  if (!rainMm || rainMm === 0) return null;
  if (rainMm < 0.5) return 'posibilidad de lluvia débil';
  if (rainMm < 2) return 'lluvia débil';
  if (rainMm < 5) return 'lluvia moderada';
  if (rainMm < 10) return 'lluvia fuerte';
  return 'lluvia intensa';
}

// Convertir grados a dirección cardinal
function degreesToDirection(deg) {
  if (deg >= 337.5 || deg < 22.5) return 'norte';
  if (deg >= 22.5 && deg < 67.5) return 'noreste';
  if (deg >= 67.5 && deg < 112.5) return 'este';
  if (deg >= 112.5 && deg < 157.5) return 'sureste';
  if (deg >= 157.5 && deg < 202.5) return 'sur';
  if (deg >= 202.5 && deg < 247.5) return 'suroeste';
  if (deg >= 247.5 && deg < 292.5) return 'oeste';
  if (deg >= 292.5 && deg < 337.5) return 'noroeste';
  return 'norte'; // fallback
}

// Construir texto
const city = data.location.name;
const condition = translateCondition(data.current.weatherDesc);
const tempMin = Math.round(data.current.tempMinC);
const tempMax = Math.round(data.current.tempMaxC);
const rain = data.current.rain1hMm;
const windMs = data.current.windMs;
const windDeg = data.current.windDeg;

// Convertir viento
let windSpeedKmh = null;
let windDirection = null;
if (windMs && windMs > 0) {
  windSpeedKmh = Math.round(windMs * 3.6); // Convertir m/s a km/h
}
if (windDeg !== null && windDeg !== undefined) {
  windDirection = degreesToDirection(windDeg);
}

let text = `Hoy en ${city}: ${condition}, con temperaturas alrededor de ${tempMin}°C por la mañana y subiendo hasta cerca de ${tempMax}°C por la tarde`;

// Añadir precipitación si hay
if (rain && rain > 0) {
  const rainDesc = getRainIntensity(rain);
  if (rainDesc) {
    text += `, y ${rainDesc}`;
  }
}

// Añadir viento si hay
if (windSpeedKmh && windSpeedKmh > 0) {
  if (windDirection) {
    text += `, con viento de ${windSpeedKmh} km/h del ${windDirection}`;
  } else {
    text += `, con viento de ${windSpeedKmh} km/h`;
  }
}

text += '.';

return { json: { weatherText: text } };
```

### Resultado

```
Hoy en Madrid: parcialmente nublado, con temperaturas alrededor de 10°C por la mañana y subiendo hasta cerca de 18°C por la tarde, y lluvia moderada, con viento de 15 km/h del noreste.
```

### Versión Simplificada (Solo Template)

Si prefieres una versión más simple sin funciones:

```javascript
const city = $json.location.name;
const condition = $json.current.weatherDesc;
const tempMin = Math.round($json.current.tempMinC);
const tempMax = Math.round($json.current.tempMaxC);
const rain = $json.current.rain1hMm || 0;

// Traducción simple de condición
let cond = condition.toLowerCase();
if (cond.includes('clear') || cond.includes('sunny')) cond = 'cielo despejado';
else if (cond.includes('partly')) cond = 'parcialmente nublado';
else if (cond.includes('cloudy')) cond = 'nublado';
else if (cond.includes('overcast')) cond = 'muy nublado';
else if (cond.includes('rain')) cond = 'lluvia';
else if (cond.includes('snow')) cond = 'nieve';
else if (cond.includes('storm')) cond = 'tormenta';

// Intensidad de lluvia
let rainText = '';
if (rain > 0) {
  if (rain < 2) rainText = ', y lluvia débil';
  else if (rain < 5) rainText = ', y lluvia moderada';
  else rainText = ', y lluvia fuerte';
}

return `Hoy en ${city}: ${cond}, con temperaturas alrededor de ${tempMin}°C por la mañana y subiendo hasta cerca de ${tempMax}°C por la tarde${rainText}.`;
```

## Referencias

- [Feature: API de Renderizado de Vídeos Meteorológicos](../features/ApiRenderizadoVideosMeteorologicos.md)
- [Parser Implementation](../../server/services/parser.ts)
- [Workflow Completo con curl](./workflow-curl.md)
