##### RECETA GENERAL PARA CREAR UN SERVICIO EN ESTE PROYECTO

1. Carpeta dedicada
2. Crear package json e instalar dependencias
3. Crear Dockerfile
4. Crear index.ts
5. Build image y push a docker hub (docker push user-name/container-name)
6. Crear archivo k8s para deployment y service
7. Actualizar skaffold.yaml para sincronizar
8. Crear archivo k8s para MongoDB, deployment y service

##### KUBERNETES SECRETS

##### creating a generic all purpose secret in kubernetes with imperative command

###### con los clusters arriba y corriendo, correr comando en terminal

`kubectl create secret generic jwt-secret --from-literal=JWT_KEY=the-secret-string`

###### para eliminar un secret

`kubectl delete secret nombre-del-secret`

###### y para ver que secrets existen

`kubectl get secrets`

######y luego en deployment se agrega
`containers: - name: auth image: nigm4silmi/auth env: # the name of the variable as it shows in the container - name: JWT_KEY` # to come from the secret created
`valueFrom: secretKeyRef: #the name of the secret name: jwt-secret #the key inside there key: JWT_KEY`

##### KUBERNETIS COMMANDS

1. Para encontrar qué pasa en un pod
   `kubectl describe pod el-name-del-pod`
   ejemplo: `kubectl describe pod 0980938405934`

2. Para saber los servicios que existen en un cluster:
   `kubectl get services`

3. Para saber qué servicios existen dentro de un namespace específico:
   `kubectl get services -n nombre-del-namespace`
   ejemplo: `kubectl get services -n ingress-nginx `
4. Para saber cuáles namespaces existen en un cluster:
   `kubectl get namespace`

5. Para entrar en un pod y ver más detalles:
   `kubectl get pods`
   `kubectl exec -it the-name-of-the-pod sh`
   `ls`, `cd`, `cat` or else

##### TESTING

- Ver refactoring y explicación del uso de app.ts
- instalar como dependencias de desarrollo:
  `npm i --save-dev @types/jest @types/supertest jest ts-jest supertest mongodb-memory-server`
- Actualizar Dockerfile para que no intente descargar cada vez mongodb-memory-server, se actualiza `RUN npm install --only=prod`
- crear script `"test": "jest --watchAll --no-cache"`
- Agregar configuración especial para jest/ts
  ` "jest":{ "preset":"ts-jest", "testEnvironment":"node", "setupFiliesAfterEnv":[ "./src/test/setup.ts" ] },`en root del package.json

##### CLIENT REQUESTS TO KUBERNETES SERVICES AND OR INGRESS-NGINX

- Ver videos desde el 224
- `kubectl get namespace`, retorna todos los namespaces que existen en nuestro cluster de kubernetes

1. Requests from the browser: permitir que el browser haga lo que regularmente hace que es pre-anexar el dominio al endpoint del request
   (recordar que esto va a localhost:80 Ingress-nginx y de allí es redirigido de acuerdo a la configuració regex del path en specs de ingress-srv.yaml )
2. Requests desde el Server Side Rendering Process, establecer un baseURL que vaya a ingress-nginx directamente, además se debe especificar en el header, el host para que sea reconocido por ingress-nginx, así:
   ` const { data } = axios.get( 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser', { headers: { Host: 'ticketing.dev' } } );`
3. Más adelante el objeto de opciones se cambia por re.headers, ya que al ejecutar getInitialProps, este dispone del objeto request

¿Y cómo sabemos cuando un request se ejecuta desde el browser vs. SSR ?

- Desde un componente --- al browser
- Desde getInitialProps --- en SSR, ejemplo en los casos:
  - Hard refresh
  - Click desde un dominio diferente
  - Escribiendo la url en el address bar
- Aunque getInitialProps se ejecuta en SSR, también se ejecuta desde el browser en circunstancias muy específicas:
  - Navegando de una página a otra dentro de la propia app

##### CROSSNAMESPACE COMMUNICATION

- El client Next JS (dentro del namespace default) se puede comunicar con el namespace Ingress-nginx a través de
  `http://NAMEOFSERVICE.NAMESPACE.svc.cluster.local/el-endpoint-de-interes` ejemplo: `http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser`

##### CODE REUSE BETWEEN SERVICES

1. Sign up or sign in to npm
2. Create public organization
3. Create common folder in project
4. Initialize npm with package.json for common folder
5. Change the name of the package to @name-of-the-organization/name-of-the-package
6. Log in if not to npm with the provided credentials in 1.
7. Commit and push the contents of common with `npm publish --access public`

###### Transpile and configs

`/common`

1. tsc --init
2. install typescript and del-cli as dev dependencies `npm i typescript del-cli --save-dev`
3. create script to transpile in package.json `"build":"tsc"`
4. create script to clean everything before a new build `"clean":"del ./build/*"`
5. update the build command `"build":"npm run clean && tsc"`
6. configure tsconfig.json to locate the source and destination in "Emit" `uncomment // "declaration": true, // "outDir": "./",` add `"outDir":"./build"`
7. `npm run build` to test it
8. Config the package.json file in the "main" field. The main field is the file that will be imported when the module is. So, change to `"./build/index.js"`
9. Add `"types":"./build/index.d.ts"`
10. Indicate which files must be published in the library `"files": ["build/**/*"]`
11. Add `.gitignore` to the common folder and add `node_modules` and `build` folder
12. To publish a new version: commit changes, change the patch version number, build and publish
13. To simplify the process of updating and publishing, (only for this course purpose), create a new script: `"pub":"git add. && git commit -m \"Updates\" && npm version patch && npm run build && npm publish"`

###### Use of the common code

Watch videos from 254 to 256

###### Updating the library and using the last version

If a change to the library code is needed, execute the set of commands after the modification, or the pub script.
After that, go to the folder where the library is been used and `npm update @organization-name/name-of-the-library`

##### NATS - NATS STREAMING SERVER

In this project we will use NATS Streaming Server

- To communicate with NATS SS we will use node-nats-streaming library
- All events will be persisted
- There will be a small stand alone project to understand how nats streaming server works.

##### NATS - NATS STREAMING SERVER standalone project

1. Create folder for the sa project
2. npm init
3. Install dependencies node-nats-streaming ts-node-dev typescript @types/node
4. Create a folder src
5. Create publisher.ts and listener.ts
6. Create scripts to run the files in 5.
7. "publish":"ts-node-dev --notify false src/publisher.ts",
   "listen":"ts-node-dev --notify false src/listener.ts"
8. Create tsconfig file with tsc --init
9. Although the way to communicate to the nats ss inside the cluster would be through ingress-inginx, in this sa project we will use another approach:create NodePort service to expose the Nats Pod to the "outside world" or create a command to redirect port 4222 directly to Nats Pod (and this is only instructional and not recommended for production apps).
10. To do 9. Find the name of the pod and run the command `kubectl port-forward <the-name-of-the-pod> portTo(local machine port):portFrom(pod port)` example: `kubectl port-forward nats-depl-7cb97d864b-c4c69 4222:4222`
11. Test the publisher running npm run publish
12. Data to be shared must be in json format
13. To monitor the events we will use the port 'monitoring' setted in nats-streaming server yaml. First forward the port 8222:8222 and then go to localhost:8222/streaming
14. To obtain more information about channels and subscriptions http://localhost:8222/streaming/channelsz?subs=1

###### NATS - refactor standalone projec to make its reusable

1. Create a Listener class, to automate the boilerplate code as much as possible.
2. The class members will each piece needed to make the subscription work.
3. The class will be an abstract class, meaning that its children will be the implemented classes.

###### Typing annotation and validation for subjects (name of the channels) and the corresponding data

1. Create an enum for the subjects
2. Create an interface to describes the coupling between subjects and data for a particular event
3. Get typescript to somehow to understand that it needs to make sure that the subject listed inside the class for that particular event, matches the type of data provided.
4. Transforming the base-listeners and base-publishers into a generic class, which type will be the specific event in each sub-class.
5. Define interface event in base-listener and base-publisher files describing a very generic type of event.

##### Concurrency issues

- See videos 298-300 to undersstand the context

###### The solution step by step

- There is a need to redesign the service in order to solve the possible concurrency issues.
- The general flow must be: Request to resource -> service that owns the resource -> Event describing change to resource -> NATS -> Event to service that needs to update its data based upon the event.
- In particular, the ticket entity will have a version to control the concurrency.
- The orders service might have more than one listener, so, in order to process the orders correctly, the logic of the listeners must check if the version of the ticket corresponds to latest version plus 1.

##### NATS - NATS inside the Ticketing app

- Where to initialize the client? in index.ts would be the logical place, but...
- Mongoose vs. NATS connections. Mongoose connection keeps track of the connectios inside the application, nats returns the client and does not share any connection external to that instance.
- The ticket created route handler will be imported into the entry point of the app, and at the same time, the route handler will need the stan connection to publish an event, that would be a circular import, and must be avoided.
- The solution will be to create a sharable instance of nats connection

##### NATS Env Variables

- We must provide a secret based value for the nats connection parameters, that is done via defining those variables in the service depl file.
- The clusterId and the nats url are a single value shared by all replicas, but each replica must have an unique clientId, so, the solution is to provide the pod id as the client id.

##### Solving concurrency issues: Document version / mongoose

###### Option 1: use mongoose-update-if-current plugin

1. npm i mongoose-update-if-current
2. in the model of interest `import {updateIfCurrentPlugin} from 'mongoose-update-if-current'`
3. after model definition: `ticketSchema.set('versionKey', 'version')`<br /> `ticketSchema.plugin(updateIfCurrentPlugin)`
4. In the interface that defines the document with all possible properties after created (extends mongoose.Document), add the version to the type definition.

###### Option 2: handle the versioning by our own

1. in the update, before the save(), set the version programmatically
2. refactor the findByEvent model method and use Model.prototype.$where that is used to add additional properties to the query when calling save() and isNew() is false.
`ticketSchema.pre('save', function(done){
   // @ts-ignore
   this.$where = { version: this.get('version) -1}
   done();
   })`

##### Solving concurrency issues: verify updates by querying directly to the cluster db

`kubectl exec -it the-name-id-of-the-db-depl-pod mongo`
` show dbs;`
` use the-db-of-interest;`
` db.tickets.find({the-property: the-value});`

##### Creating a listener in ticket service for orders event

- this is necessary because when an order is created, the ticket must be blocked for a period of time to prevent that two users buy the same ticket
- after a period of time, if the order is not checked out, the ticket must be released so another user can buy it
  How do we do this?

1. adding an order-created-listener.ts in which:
   a. extend the base listener
   b. use typescript to guide the implementation
   c. remember that the subject will come from the enum defined as Subjects
   d. The queueGroupName will come from a constant that we must explicitly define
   e. Remember that onMessage is the method where is the logic that must be triggered when an event occurs
2. figure out a strategy to lock a ticket
   a. add a locked property as a boolean, but this is not a flexible solution because if the owner of the ticket (the event producer or whatever) needs to know what is going on with a specific ticket transaction, there woold be not much information about it. So it is better to have also a piece of code that contains the order that is trying to purchase the ticket
   a. inside onMessage from OrderCreated, the ticket id comes in the event, so we can use it to fetch the ticket and add the orderId to the ticket
   b. modify the Ticket model in order to add the property orderId => first add it to the schema and then to the TicketDoc interface

##### Missing updated event for the orders service

Prologue:

1. When an order is created, an order:created event is published and the tickets service is listening to add the orderId to the ticket
2. When the orderId is added to the ticket, the version is incremented (mongoDB behavior)
3. If the user cancels the order, the orderId will be removed from the ticket and the version will be incremented as well
4. Then the owner of the ticket, may edit the price to make it more affordable, the version will increase, a ticket:updated is published and the order service is listening, but...
5. The order service never knew about the version change because the order service saves a copy of the ticket in its own related ticket db only when a ticket is created or is updated, so with 4, the order service will not update the ticket because its version is far along in the future

Solution:

1. Let the order service know about any change in the ticket(s)
2. Emit an event for the order created listener, inside the ticket service when an order is created
3. Include in the event for ticket updated, the orderId
4. To do 3. we need an instance of the Stan client, but this is a private property in the base listener, so we need to change it to protected
5. We don't import the nats-wrapper directly inside the order created listener because this will introduce a difficulty for testing this listener, given that will alter the way that the nats-wrapper is used (and already mocked in all the tests)

##### Expiration Service

The goal of this service is keeping track of the time that the user has from the creation of the order to complete the payment for the ticket

1. Needs to listen to order:created event
2. Implements specific logic
3. Needs to emit an expiration:complete
4. Can't be a timer like setTimeout because timers are stored in memory, and if the service restart, all timers will be lost
5. Rely on NATS redelivery, by not acking the msg if it is in the future, and acking when it is in the past, but, the redelivering could be out of control for the developers
6. Use another event bus (because this is not supported by nats) to wait for 15 minutes (the allowed time) to publish the message expiration:complete
7. Use Bull JS allows to set long lived timers, is a Redis-based queue for Node
8. When an order:created event is emmited, the expiration service will implement a login that uses Bull to "remind to do something" in x time, Bull will save that "reminder" inside a Redis instance, a Job scheduled to do in the future, Redis will notificate to Bull and then Bull will comunicate the reminder to the Expiration service

##### Expiration Service: Remember docker setup

1. Inside of the service folder: `docker build -t dockerhub-id/expiration .` (builds Docker images from a Dockerfile and a “context”.)
2. Push to dockerhub `docker push dockerhub-id/expiration `
3. Create a deployment config file for the Redis instance inside of k8s dir
4. Create a deployment config file for the pod, this won't have a clusterIP service because the communication will go through nats only

##### Expiration Service: Roadmap

1. Create a listener for order:created
2. Implement logic for expiration
3. Publish an event expiration:completed

##### Expiration Service: Bull, its traditional use

1. Request e.g. convert mp4 file to mkv file (lots of processing)
2. Request to Web server with Bull JS
3. Bull creates a job (it is a plain JS Object with some information relate to the processing) and adds to a queue of redis
4. The jobs of the redis server are constantly pulled by a worker serves (that also uses Bull JS), then comes the processing, that when finishes, the worker server sends an event to the redis server to alert that the processing is done

##### Expiration Service: Bull, general project implementation

1. The event order:created is listened to by the expiration service
2. The service creates the expirationQueue, from which flows out and in, a list of jobs
3. Eventually an expiration:complete event is published
4. In this case, the web server and the worker server are the same server inside of the expiration service

##### Expiration Service: Bull, specific project implementation

1. On receiving order:created, the expirationQueue will be used to <strong>enqueue</strong> (produce) a job with a specific type
2. A job is very similar to a nats message (event)
3. The job will be sent to Redis server, until the given time has elapsed
4. The the Redis server will send it back to the expirationQueue
5. The expirationQueue then processes the job, which involves publishing a message of expiration:complete
6. What information must be saved in the job? the id of the order

##### Payments Service

1. Will listen to order:created, to keep track of an order that potentially will submit a payment with a specific price amount
2. Will listen to order:cancelled to know when to reject a payment for a specific order
3. Will publish a charge:created to let the order service know that someone has paid for an order

### Payments Service: remember the complete process of creating and configuring a service.

- Basic skaffolding and configuration

  1.  in the root of its folder, there must be a `package.json`, a `tsconfig.json`, a `Dockerfile` and a `.dockerignore` files
  2.  must contain a main folder (src or wthvr)
  3.  in the main folder there must be at least: the global mocks objects, the global setup for tests, app.ts and index.ts (separated to accomodate to the supertest setup)
  4.  the client class and consequently its singleton (nats specific need in order to share it accross the application)

- Building its related image

  1.  Build the image at the root of the service, having into account the Dockerfile
  2.  Push the image to DockerHub

- Kubernetes objects

  1.  Create a configuration file with the pod configuration (deployment) and the clusterIP service related configuration (if needed, is not the case of the expiration service)
  2.  Create a deployment for data bases if needed
  3.  Configure skaffold if it is been used

- Define the events needed to listen

  1.  What are their characteristics and when they will be emmited

- Define the events needed to publish

  1.  What are their characteristics and when they will be published

- By defining the events, will emerge the need...

  1.  To create models and type of documents in a collection (non-relational db) or the tables and its relations for a given db

- Define and wire up the listeners and publishers

### Payments flow: Stripe

1. The cc details goes to the stripe API, and responds with a token
2. The token is a pre authorization (one time use)
3. The stripe client in our service make this token available for our services to finally charge the user
4. To check the functionality we will use automated tests

### Payments flow: Stripe + Payments Service

1. Requesto to create a charge, with a token
2. Find the order that the user is trying to pay for
3. Make sure the order belongs to that user
4. Make sure the payment amount matches the amount of the order
5. Verify the payment with Stripe API
6. Create charge record of the successful payment

### Payments flow: Stripe config

1. Install the Stripe sdk in the payments service `npm i stripe`
2. Sign in for a Stripe account
3. Get an api key
4. Create a generic secret in the kubernetes cluster `kubectl create secret generic the-name-of-the-secret --from-literal SOMEKEY=SOMEVALUE` to check the existing secrets `kubectl get secrets`
5. In the deployment file, config to take the secret and add to the payments service pod

```
 - name: STRIPE_KEY
              valueFrom:
                secretKeyRef:
                  name: stripe-secret
                  key: STRIPE_KEY
```

6. Initialize Stripe sdk with the secret key

### Payments flow: Stripe testing

- To test a charge manually.

  1. Make sure that the stripe account is in test mode.
  2. In postman create a ticket, then create an order with the ticket id, create a request to payments, add the orderId and add the token "tok_visa"

- Automated testing
  1. The Stripe API can be used and is one option, if we are accessing to the cluster and pod to create the tests. That is not the case for this app.
  2. Using mock around the stripe. Remember the mock file itself and then wire it up in the setup file

### Client side with NextJS - Part 2

After initial setup and auth related pages, and with all services running

```

```

##### ERRORES EN EL CAMINO

`POST http://ticketing.dev/api/users/signup`

###### Error: connect ECONNREFUSED 127.0.0.1:80

###### solución sugerida en Q&A del curso

`kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission`

###### no funciona

https://stackoverflow.com/questions/62162209/ingress-nginx-errors-connection-refused

###### no funciona

##### agregar en `/etc/hosts` en lugar de `127.0.01` => `127.0.0.1:80`

###### no funciona

###### solución: se había eliminado el pod ingress-nginx en una limpieza de primavera, así que la solución fue:

`kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.0/deploy/static/provider/cloud/deploy.yaml`

### to debug ingress-nginx

```
kubectl describe service ingress-nginx-controller -n ingress-nginx
```
