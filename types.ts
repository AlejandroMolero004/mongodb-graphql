import { ObjectId, OptionalId } from "mongodb";

export type DinosaurioDB={
    _id?:ObjectId,
    id:number,
    nombre:string,
    tipo:string
}

export type Dinosaurio={
    _id:string,
    id:number,
    nombre:string,
    tipo:string
}