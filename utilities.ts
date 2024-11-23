import { Dinosaurio, DinosaurioDB } from "./types.ts";

export const frommodeltodinosaurio=(model:DinosaurioDB):Dinosaurio=>{
    return {
        _id:model._id!.toString(),
        id:model.id,
        nombre:model.nombre,
        tipo:model.tipo
    }


}