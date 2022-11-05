const http = require("http");
const { request } = require("https");
const path = require("path");
const fs = require("fs").promises;

const PORT = 8000;

const app = http.createServer(async (req, res) => {
    const url = req.url;
    const methodHTTP = req.method;
    
    if (url === "/apiv1/tasks") {
        const jsonPath = path.resolve("./tasks.json");
        const jsonData = await fs.readFile(jsonPath, "utf8");
        if (methodHTTP === "GET") {
            res.setHeader("Content-Type", "application/json");
            res.writeHead("200");
            res.write(jsonData);
        }
        if (methodHTTP === "POST") {//Enviando un body con un task puede tener o no la propiedad "id"
            const tasksArray = JSON.parse(jsonData);//convertir el contendido del JSON en un arreglo
            req.on("data", async (data) => {
                const newTask = JSON.parse(data); //Convertir la tarea JSON a un objeto javascript.
                newTask.id = tasksArray[tasksArray.length - 1].id + 1; //Adicionar al a tarea la propiedad id y si ya la tiene sobreescribirla.
                tasksArray.push(newTask); //Adicionar un nuevo elemento al arreglo de tareas.
                console.log(tasksArray);
                const newDataJson = JSON.stringify(tasksArray); //Convertir el arreglo de tareas en contenido tipo JSON
                await fs.writeFile(jsonPath, newDataJson);//Sobreescribir el JSON con el nuevo contenido.
            });
            res.writeHead("201");
        }
        if (methodHTTP === "PUT") { //Enviando un body con un task debe tener la propiedad "id" y la propiedad "status": false
            const tasksArray = JSON.parse(jsonData);//convertir el contendido del JSON en un arreglo
            req.on("data", async (data) => {
                const task = JSON.parse(data);
                const id = task.id;

                tasksArray.filter(item => {
                    if (item.id === id) {
                        item.status = task.status;
                        return item;
                    }
                    else return item;
                });
                console.log(tasksArray);
                const newDataJson = JSON.stringify(tasksArray);
                await fs.writeFile(jsonPath, newDataJson);
            });
            res.writeHead("204");
        }
        if (methodHTTP === "DELETE") { //Enviando body con un task solo con la propiedad "id"
            const tasksArray = JSON.parse(jsonData);//convertir el contendido del JSON en un arreglo
            req.on("data", async (data) => {
                const task = JSON.parse(data);
                const id = task.id;
                const newTasksArray= tasksArray.filter(item=>item.id!=id);
                console.log(newTasksArray);
                const newDataJson = JSON.stringify(newTasksArray);
                await fs.writeFile(jsonPath, newDataJson);
            });
            res.writeHead("202");
        }

    }
    else {
        res.writeHead("503");
    }
    res.end();
});

app.listen(PORT);



    
