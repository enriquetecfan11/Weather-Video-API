# Componentes Remotion

Documentación completa de los componentes React utilizados en las composiciones de vídeo meteorológico.

## Visión General

El sistema de componentes está organizado en varias categorías:

1. **Componentes de Partículas Animadas**: Efectos visuales de fondo estilo fuegos artificiales
2. **Componentes de Animación Reutilizables**: Wrappers de animación con configuraciones spring
3. **Componentes de Contenido**: Componentes que muestran información meteorológica
4. **Componentes de Utilidad**: Componentes auxiliares para efectos visuales

## Sistema de Partículas Animadas

Sistema modular de efectos visuales que crea partículas animadas en el fondo del vídeo, similar a fuegos artificiales.

### Arquitectura

El sistema funciona como una cadena de componentes anidados:

```
AnimatedParticles
  └── Explosion (multiplica en 10 direcciones radiales)
      └── Trail (crea estelas múltiples)
          └── Shrinking (reduce escala con el tiempo)
              └── Move (movimiento vertical)
                  └── AnimatedDot (punto visual)
```

### Componentes

#### `AnimatedBackground`

Fondo con gradiente oscuro estilo Apple para formato vertical.

**Ubicación**: `src/components/AnimatedBackground.tsx`

**Props**: Ninguna

**Uso**:
```tsx
<AnimatedBackground />
```

**Características**:
- Gradiente lineal de `#000021` a `#010024` (de arriba a abajo)
- Cubre toda la composición con `AbsoluteFill`

#### `AnimatedParticles`

Contenedor principal del sistema de partículas. Orquesta todos los efectos.

**Ubicación**: `src/components/AnimatedParticles.tsx`

**Props**: Ninguna

**Uso**:
```tsx
<AnimatedParticles />
```

**Características**:
- Opacidad reducida (0.6) para no interferir con el contenido
- `pointerEvents: "none"` para no bloquear interacciones
- Z-index: 1 (sobre el fondo, debajo del contenido)

**Estructura Interna**:
- Usa `Explosion` para crear múltiples direcciones
- Cada dirección tiene un `Trail` con 4 estelas
- Las partículas aparecen con delay de 5 frames usando `Sequence`

#### `AnimatedDot`

Punto base visual para las partículas.

**Ubicación**: `src/components/AnimatedDot.tsx`

**Props**: Ninguna

**Características**:
- Círculo de 14x14px
- Color: `#ccc`
- Centrado en la composición

#### `Explosion`

Efecto que multiplica el contenido en múltiples direcciones radiales (como una explosión).

**Ubicación**: `src/components/Explosion.tsx`

**Props**:
- `children`: React.ReactNode - Contenido a multiplicar

**Características**:
- Crea 10 copias del contenido
- Cada copia rotada `(i / 10) * 2π` radianes
- Distribución uniforme en 360 grados

**Uso**:
```tsx
<Explosion>
  <AnimatedDot />
</Explosion>
```

#### `Trail`

Crea múltiples estelas del mismo contenido con delays escalonados.

**Ubicación**: `src/components/Trail.tsx`

**Props**:
- `amount`: number - Número de estelas a crear
- `extraOffset`: number - Offset adicional en píxeles
- `children`: React.ReactNode - Contenido a duplicar

**Características**:
- Cada estela aparece con delay de 3 frames respecto a la anterior
- Escala disminuye progresivamente: `1 - i / amount`
- Usa `Move` para animación vertical

**Uso**:
```tsx
<Trail amount={4} extraOffset={0}>
  <AnimatedDot />
</Trail>
```

#### `Move`

Aplica movimiento vertical animado usando spring physics.

**Ubicación**: `src/components/Move.tsx`

**Props**:
- `children`: React.ReactNode
- `delay`: number - Delay en frames antes de iniciar

**Características**:
- Movimiento vertical hacia arriba (-400px)
- Usa `spring` con damping: 200
- Duración: 120 frames

**Uso**:
```tsx
<Move delay={0}>
  <AnimatedDot />
</Move>
```

#### `Shrinking`

Efecto de reducción de escala con el tiempo.

**Ubicación**: `src/components/Shrinking.tsx`

**Props**:
- `children`: React.ReactNode

**Características**:
- Escala de 1 a 0 entre los frames 60 y 90
- Interpolación con clamp para evitar valores fuera de rango

**Uso**:
```tsx
<Shrinking>
  <AnimatedDot />
</Shrinking>
```

## Componentes de Animación Reutilizables

Componentes wrapper que proporcionan animaciones reutilizables con configuraciones spring personalizables.

**Ubicación**: `src/components/animations/`

Todos los componentes de animación comparten:
- Configuraciones spring predefinidas (DRAMATIC, SMOOTH, SUBTLE)
- Soporte para delays personalizados
- Duración configurable en frames
- Integración con el sistema de frames de Remotion

### `FadeIn`

Animación de fade in con física spring.

**Props**:
```typescript
{
  children: React.ReactNode;
  delay?: number; // Segundos
  duration?: number; // Frames
  fromOpacity?: number; // 0-1
  toOpacity?: number; // 0-1
  springConfig?: "DRAMATIC" | "SMOOTH" | "SUBTLE";
}
```

**Valores por defecto**:
- `delay`: 0
- `duration`: 30 frames
- `fromOpacity`: 0
- `toOpacity`: 1
- `springConfig`: "SMOOTH"

**Uso**:
```tsx
<FadeIn delay={0.5} springConfig="SUBTLE">
  <div>Contenido que aparece</div>
</FadeIn>
```

### `ScaleIn`

Animación de escala con fade opcional.

**Props**:
```typescript
{
  children: React.ReactNode;
  delay?: number; // Segundos
  duration?: number; // Frames
  fromScale?: number;
  toScale?: number;
  springConfig?: "DRAMATIC" | "SMOOTH" | "SUBTLE";
  withFade?: boolean; // Si true, combina con fade
}
```

**Valores por defecto**:
- `delay`: 0
- `duration`: 30 frames
- `fromScale`: 0.8
- `toScale`: 1
- `springConfig`: "DRAMATIC"
- `withFade`: true

**Uso**:
```tsx
<ScaleIn 
  delay={0.3} 
  fromScale={0.5} 
  springConfig="DRAMATIC"
  withFade={true}
>
  <TemperatureDisplay temperature={25} unit="C" />
</ScaleIn>
```

### `SlideIn`

Animación de deslizamiento en 4 direcciones con fade opcional.

**Props**:
```typescript
{
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  distance?: number; // Píxeles
  delay?: number; // Segundos
  duration?: number; // Frames
  springConfig?: "DRAMATIC" | "SMOOTH" | "SUBTLE";
  withFade?: boolean;
}
```

**Valores por defecto**:
- `direction`: "up"
- `distance`: 50px
- `delay`: 0
- `duration`: 30 frames
- `springConfig`: "SMOOTH"
- `withFade`: true

**Uso**:
```tsx
<SlideIn 
  direction="up" 
  distance={40} 
  delay={0.5}
  springConfig="SMOOTH"
>
  <div>Contenido que se desliza</div>
</SlideIn>
```

### `WordReveal`

Revela texto palabra por palabra con fade y movimiento sutil.

**Props**:
```typescript
{
  text: string;
  delay?: number; // Segundos
  wordDelay?: number; // Segundos entre palabras
  children?: (word: string, index: number, opacity: number) => React.ReactNode;
}
```

**Valores por defecto**:
- `delay`: 0
- `wordDelay`: 0.05 segundos

**Características**:
- Cada palabra tiene fade in de 0.3 segundos
- Movimiento vertical sutil (10px hacia arriba)
- Render personalizable mediante prop `children`

**Uso básico**:
```tsx
<WordReveal 
  text="Hoy en Madrid: soleado, 25°C" 
  delay={1}
  wordDelay={0.06}
/>
```

**Uso con render personalizado**:
```tsx
<WordReveal 
  text="Texto a revelar"
  children={(word, index, opacity) => (
    <span style={{ 
      opacity, 
      color: index % 2 === 0 ? 'white' : 'yellow' 
    }}>
      {word}
    </span>
  )}
/>
```

## Componentes de Contenido

### `TemperatureDisplay`

Componente mejorado para mostrar temperatura con animaciones separadas para número y unidad.

**Ubicación**: `src/components/TemperatureDisplay.tsx`

**Props**:
```typescript
{
  temperature: number;
  unit: "C" | "F";
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  maxWidth?: number;
  delay?: number; // Segundos
}
```

**Valores por defecto**:
- `fontSize`: 120
- `fontWeight`: 700
- `color`: THEME.COLORS.PRIMARY_TEXT
- `delay`: 0

**Características**:
- Animación separada para número (aparece primero) y unidad (0.15s después)
- Número usa spring DRAMATIC, unidad usa SMOOTH
- Gap dinámico entre número y unidad basado en fontSize
- Redondeo automático del valor

**Uso**:
```tsx
<TemperatureDisplay 
  temperature={25} 
  unit="C" 
  fontSize={120}
  delay={0.3}
/>
```

### `WeatherForecast`

Composición principal que integra todos los componentes.

**Ubicación**: `src/components/WeatherForecast.tsx`

**Características principales**:
- Integra `AnimatedBackground` y `AnimatedParticles` para efectos visuales
- Usa componentes de animación (`ScaleIn`, `SlideIn`, `FadeIn`, `WordReveal`) para transiciones
- Layout adaptativo que se ajusta a contenido largo
- Estructura narrativa en 4 bloques temporales
- Soporte para múltiples idiomas

Ver [Arquitectura](../architecture/) para más detalles sobre la estructura narrativa.

## Constantes y Utilidades

### Configuraciones Spring

Definidas en `src/utils/constants.ts`:

```typescript
SPRING_CONFIGS = {
  DRAMATIC: { damping: 15, mass: 0.5, stiffness: 200 },  // Entradas impactantes
  SMOOTH: { damping: 25, mass: 0.8, stiffness: 150 },    // Transiciones suaves
  SUBTLE: { damping: 30, mass: 1, stiffness: 100 }         // Efectos sutiles
}
```

### Funciones de Easing

Definidas en `src/utils/animations.ts`:

- `clamp`: Configuración de extrapolación para mantener valores en rango
- `easeOutCubic`: Easing cúbico de salida
- `easeInOutCubic`: Easing cúbico de entrada/salida
- `easeOutExpo`: Easing exponencial de salida
- `applyEasing`: Helper para aplicar easing a interpolaciones

### Timing

Configuraciones de timing para bloques narrativos en `src/utils/constants.ts`:

- **Bloque 1** (0-4s): Temperatura + Ciudad
- **Bloque 2** (3.5-9s): Condición, Sensación, Viento
- **Bloque 3** (9-13s): Fenómenos (precipitaciones)
- **Bloque 4** (12-18s): Descripción completa
- **Outro** (18-22s): Fade out final

## Guía de Uso

### Crear una Nueva Animación

1. Usa los componentes de animación existentes cuando sea posible:
```tsx
<ScaleIn delay={0.5} springConfig="SMOOTH">
  <TuComponente />
</ScaleIn>
```

2. Para animaciones personalizadas, usa `useCurrentFrame()` y `interpolate`:
```tsx
const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 30], [0, 1], clamp);
```

3. Usa configuraciones spring para animaciones naturales:
```tsx
const progress = spring({
  fps,
  frame: frame - delay * fps,
  config: SPRING_CONFIGS.SMOOTH,
  durationInFrames: 30,
});
```

### Mejores Prácticas

1. **Delays escalonados**: Usa delays progresivos para crear efectos de cascada
2. **Configuraciones apropiadas**: Usa DRAMATIC para elementos principales, SMOOTH para secundarios
3. **Performance**: Evita animaciones complejas en cada frame, usa interpolaciones eficientes
4. **Consistencia**: Reutiliza componentes de animación en lugar de crear nuevos cada vez

## Ejemplos Completos

### Ejemplo: Entrada de Tarjeta

```tsx
<ScaleIn
  delay={0.5}
  fromScale={0.9}
  springConfig="SMOOTH"
  withFade={true}
>
  <SlideIn
    direction="up"
    distance={50}
    delay={0.5}
    springConfig="SMOOTH"
    withFade={false}
  >
    <PhenomenonCard
      type="rain"
      intensity="moderate"
      probability={60}
    />
  </SlideIn>
</ScaleIn>
```

### Ejemplo: Revelado de Texto

```tsx
<FadeIn delay={1} springConfig="SUBTLE">
  <div style={{ fontSize: 60, padding: 40 }}>
    <WordReveal
      text="Hoy en Madrid: soleado, 25°C, viento suave"
      delay={1.2}
      wordDelay={0.06}
    />
  </div>
</FadeIn>
```

## Referencias

- [Remotion Documentation](https://www.remotion.dev/docs)
- [Arquitectura del Sistema](../architecture/)
- [Constantes y Configuración](../../src/utils/constants.ts)