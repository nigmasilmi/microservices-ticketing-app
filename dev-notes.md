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

-
