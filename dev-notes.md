##### RECETA GENERAL PARA CREAR UN SERVICIO EN ESTE PROYECTO

1. Carpeta dedicada
2. Crear package json e instalar dependencias
3. Crear Dockerfile
4. Crear index.ts
5. Build image y push a docker hub
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
