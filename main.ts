import{MongoClient}from "mongodb"
import{ApolloServer}from "@apollo/server"
import { startStandaloneServer } from "npm:@apollo/server@4.1/standalone";
import { Dinosaurio, DinosaurioDB } from "./types.ts";
import { frommodeltodinosaurio } from "./utilities.ts";

const MONGO_URL=Deno.env.get("MONGO_URL")

if(!MONGO_URL){
  console.error("MONGO_URL is no set")
  Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Connected to MongoDB")

const db=client.db("Dinosaurios")

const dinosaurios=db.collection<DinosaurioDB>("Dinosaurio")

const schemaGQL=`#graphql
  type Dinosaurio{
    _id:String!
    id:Int!
    nombre:String!
    tipo:String!
  }
  type Query{
    getDinosaurios:[Dinosaurio!]!
    getDinosaurio(id:Int!):Dinosaurio
  }
  type Mutation{
    addDinosaurio(id:Int!,nombre:String!,tipo:String!):Dinosaurio
    deleteDinosaurio(id:Int!):String
    modifyDinosaurio(id:Int!,nombre:String!,tipo:String!):String
  }
`
const resolvers={
    Query:{
      getDinosaurios:async ():Promise<Dinosaurio[]>=>{
        const dinosauriosDB=await dinosaurios.find().toArray()
        const dino=dinosauriosDB.map((d)=>frommodeltodinosaurio(d))
        return dino
      },
      getDinosaurio:async(_:unknown,args:{id:number}):Promise<Dinosaurio|null>=>{
        const dinosauriosDB=await dinosaurios.findOne({id:args.id})
        if(dinosauriosDB==null){
          return null
        }
        else{
        const dino=frommodeltodinosaurio(dinosauriosDB)
        return dino;
        }
      }
    },
    Mutation:{
      addDinosaurio:async(_:unknown,args:{id:number,nombre:string,tipo:string}):Promise<Dinosaurio|string>=>{
        const dino=await dinosaurios.findOne({id:args.id})
        if(dino){
          throw new Error("Dino already exists");
        }
       const{insertedId}=await dinosaurios.insertOne({
          id: args.id,
          nombre: args.nombre,
          tipo: args.tipo,
       })
       return {
        _id: insertedId?.toString(), // Convierte `_id` a string
        id: args.id,
        nombre: args.nombre,
        tipo: args.tipo,
      };
      },
      deleteDinosaurio:async(_:unknown,args:{id:number}):Promise<string|undefined>=>{
        const dino=await dinosaurios.findOne({id:args.id})
        if(dino){
          const{deletedCount}=await dinosaurios.deleteOne({id:args.id})
          if(deletedCount===0){
            return "dino not found"
          }
          return "dino eliminated"
        }
        return "dino not found"
      },
      modifyDinosaurio:async(_:unknown,args:{id:number,nombre:string,tipo:string}):Promise<string|undefined>=>{
        const dino= await dinosaurios.findOne({id:args.id})
        if(dino){
          const{modifiedCount}= await dinosaurios.updateOne(
            {"id":args.id},
            {$set:{id:args.id,nombre:args.nombre,tipo:args.tipo}}
          )
          if(modifiedCount===0){
            return "dino not found"
          }
           return "dino modificated"
        }
        return "dino no encontrado"
      }
    }

}

  const server=new ApolloServer({
  typeDefs:schemaGQL,
  resolvers
  })
  const{url}=await startStandaloneServer(server,{
  listen:{port:8081}
  })
  console.log(`Server running on:${url}`);