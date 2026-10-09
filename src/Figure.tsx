import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const modelUrl = new URL('../assets/naveen-portfolio.glb', import.meta.url).href

export default function Figure({ active, theme }: { active: boolean; theme: 'light' | 'dark' }) {
  const mount = useRef<HTMLDivElement>(null)
  const state = useRef({ active, theme })
  useEffect(() => { state.current = { active, theme } }, [active, theme])

  useEffect(() => {
    const element = mount.current
    if (!element) return
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' }) || canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' })
    if (!context) return
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: 'low-power' }) } catch { return }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    element.appendChild(renderer.domElement)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 20)
    camera.position.set(0, 0, 7.3)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6c6070, 2.4))
    const key = new THREE.DirectionalLight(0xffffff, 2.6)
    key.position.set(-3, 5, 5); scene.add(key)
    const fill = new THREE.DirectionalLight(0xc6a466, .8)
    fill.position.set(4, 1, 2); scene.add(fill)
    const figure = new THREE.Group(); scene.add(figure)
    const headTurn = new THREE.Vector2()
    new GLTFLoader().load(modelUrl, ({ scene: model }) => {
      model.position.sub(new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3()))
      model.scale.setScalar(2.1)
      model.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach(material => {
          material.onBeforeCompile = (shader: Parameters<THREE.Material['onBeforeCompile']>[0]) => {
            shader.uniforms.headTurn = { value: headTurn }
            shader.vertexShader = `uniform vec2 headTurn;\n${shader.vertexShader}`
              .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
                {
                float headWeight = smoothstep(.08, .36, position.y);
                float cy = cos(headTurn.x * headWeight), sy = sin(headTurn.x * headWeight);
                float cx = cos(headTurn.y * headWeight), sx = sin(headTurn.y * headWeight);
                objectNormal = mat3(cy,0.,-sy, 0.,1.,0., sy,0.,cy) * mat3(1.,0.,0., 0.,cx,sx, 0.,-sx,cx) * objectNormal;
                }`)
              .replace('#include <begin_vertex>', `#include <begin_vertex>
                {
                float headWeight = smoothstep(.08, .36, position.y);
                float cy = cos(headTurn.x * headWeight), sy = sin(headTurn.x * headWeight);
                float cx = cos(headTurn.y * headWeight), sx = sin(headTurn.y * headWeight);
                transformed -= vec3(0., .3, 0.);
                transformed = mat3(cy,0.,-sy, 0.,1.,0., sy,0.,cy) * mat3(1.,0.,0., 0.,cx,sx, 0.,-sx,cx) * transformed;
                transformed += vec3(0., .3, 0.);
                }`)
          }
          material.needsUpdate = true
        })
      })
      figure.add(model)
    }, undefined, error => console.error('Could not load portfolio model', error))
    const pointer = { x: 0, y: 0, last: 0 }
    const onPointer = (event: PointerEvent) => { const rect = element.getBoundingClientRect(); pointer.x = THREE.MathUtils.clamp(((event.clientX-rect.left)/rect.width-.5)*2,-1,1); pointer.y = THREE.MathUtils.clamp(((event.clientY-rect.top)/rect.height-.5)*2,-1,1); pointer.last = performance.now() }
    window.addEventListener('pointermove', onPointer, { passive:true })
    window.addEventListener('pointerdown', onPointer, { passive:true })
    const resize = () => { const { width, height } = element.getBoundingClientRect(); if (width && height) { camera.aspect = width / height; camera.position.z = width < 390 ? 7.8 : 7.3; camera.updateProjectionMatrix(); renderer.setSize(width,height,false) } }
    const observer = new ResizeObserver(resize); observer.observe(element); resize()
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const animate = (time: number) => {
      frame = requestAnimationFrame(animate)
      if (!state.current.active || document.hidden) return
      const idle = time-pointer.last > 3200
      const yaw = reduced.matches ? 0 : (idle ? Math.sin(time/2800)*.09 : pointer.x * .87)
      const pitch = reduced.matches ? 0 : (idle ? Math.sin(time/3400)*.045 : pointer.y*.49)
      headTurn.x = THREE.MathUtils.lerp(headTurn.x, yaw*.45, .065)
      headTurn.y = THREE.MathUtils.lerp(headTurn.y, pitch*.2, .065)
      figure.position.y = reduced.matches ? 0 : Math.sin(time/1200)*.025
      renderer.render(scene,camera)
    }
    frame = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('pointermove',onPointer); window.removeEventListener('pointerdown',onPointer); scene.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => material.dispose()) } }); renderer.dispose(); renderer.domElement.remove() }
  }, [])
  return <div className="figure-canvas" ref={mount} aria-hidden="true" />
}
