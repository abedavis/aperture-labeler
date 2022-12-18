# AniGraph Final Project Starter Code



### [ANodeModel3D]()


```typescript
    constructor(verts?:VertexArray3D, transform?:NodeTransform3D);
    
    transform:NodeTransform3D;

    /**
     * setTransform(T) lets you set the transform property with other classes, particularly with a Mat4 matrix 
     */
    setTransform(transform:TransformationInterface);
    
    /**
     * getWorldTransform() returns the transformation from the current node to world coordinates, computed by multiplying with parent transformations as you did in 2D for A2. This time we have implemented it for you, as it is essentially the same as it was in A2. 
     */
    getWorldTransform():NodeTransform3D;

    /**
     * setting verts wholesale will trigger a geometry update for any listening views, but updating individual
     * properties of verts will not. To manually trigger a geometry update, call signalGeometryUpdate()
     */
    verts:VertexArray3D

    addGeometryListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true):ACallbackSwitch

    addMaterialUpdateListener(callback:(...args:any[])=>void, handle?:string):ACallbackSwitch

    addMaterialChangeListener(callback:(...args:any[])=>void, handle?:string):ACallbackSwitch

    addTransformListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true):ACallbackSwitch
```





### Common Pitfalls

#### "Uncaught TypeError: Class extends value undefined is not a constructor or null"
This is usually a circular import of some sort...
