# Material Constitution

# 材料憲章 v0.1

本文件定義：

- unified material semantics
- material field rules
- material runtime representation
- multi-physics material meaning
- material authority
- runtime material approximation

本文件為：

# Unified Material Runtime 的語意規格來源。

---

# 1. Core Principle

Material：

不是：

```txt
Texture
```

Material：

為：

# Unified Multi-Physics Semantic Representation。

---

# 2. Material Semantics

Material：

至少包含：

- optical
- mechanical
- thermal
- chemical
- biological
- structural

資訊。

禁止：

```txt
Visual Material != Physical Material
```

造成世界語意分裂。

---

# 3. Material IR

所有 material：

最終必須輸出：

```txt
Material IR
```

作為：

- renderer
- physics
- biology
- thermal
- gameplay
- streaming runtime

之間的統一語意層。

---

# 4. Material Field

Material：

不應僅存在於 mesh surface。

Material：

允許存在於：

```txt
3D Spatial Field
```

例如：

- density
- stress
- temperature
- anisotropy
- fracture
- fatigue
- biological state

等空間分布。

---

# 5. Material Authority

Material semantics：

不得由：

- renderer
- gameplay
- UI

獨立定義。

Material truth：

必須遵守：

- authority constitution
- simulation ABI
- runtime constitution

---

# 6. Runtime Material Approximation

Runtime：

不得直接依賴：

- full molecular simulation
- full FEM state
- full solver state

Runtime：

應優先使用：

- compiled proxy
- LUT
- tensor proxy
- reduced field
- approximation layer

---

# 7. Multi-scale Material Principle

不同尺度：

允許：

- different solver
- different representation
- different approximation

但：

必須共享：

- semantic meaning
- material identity
- energy rules
- structural semantics

---

# 8. Material Anisotropy

Material：

允許：

- directional strength
- directional conductivity
- directional fracture
- directional optical response

Runtime：

不得假設：

```txt
所有 material 為 isotropic
```

---

# 9. Material Proxy

Runtime Material：

應優先使用：

```txt
Compiled Material Proxy
```

Material Proxy：

必須支援：

- streaming
- serialization
- deterministic runtime
- distributed simulation
- replay

---

# 10. Material Validation

所有 material asset：

應允許：

- thermal validation
- structural validation
- energy validation
- stability validation

禁止：

```txt
無法收斂或語意衝突的 material state
```

進入 canonical runtime。

---

# 11. Renderer Separation

PBR：

不是 material truth。

PBR：

為：

```txt
Material Optical Projection
```

Renderer：

只能觀察 runtime material representation。

---

# 12. Final Principle

Material：

不是 shader data。

Material：

是：

# 世界多物理場語意的核心載體。
