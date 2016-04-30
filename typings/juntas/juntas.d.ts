﻿
declare module juntas {
    export interface IDb {
        collection(collection: string): any;

    }
    export interface IDal {
        db: any;

    }
    


    export interface IDbCollection {
        find(query: any, callback: Function): any;
        limit(num: number): any;
        next(callback: Function): any;
        ensureIndex(): any;
        toArray(callback: Function): any;
        each(callback: Function): any;
        save(data: any, callback: Function): any;
    }

 
     

}

 

declare module NodeJS {
    interface Global {
        appRoot: string;
        clientAppRoot: string;
        eventServer: any;
        socket: any;
        Rooms: any;
        config: any;
        terminals: any;
        api_token: string;
    }





}