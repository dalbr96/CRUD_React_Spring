package co.com.sofka.crud;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.websocket.server.PathParam;

@RestController
public class TodoController {

    @Autowired
    private TodoService service;

    @GetMapping(value = "api/{id}/todo")
    public Todo get(@PathVariable("id") Long id){
        return service.get(id);
    }

    @GetMapping(value = "api/todos")
    public Iterable<Todo> list(){
        return service.list();
    }

    @PutMapping(value = "api/todo")
    public Todo update(@RequestBody Todo todo){
        if(todo.getId() != null){
            return service.save(todo);
        }
        throw new RuntimeException("Id does not exist to update.");
    }

    @PostMapping(value = "api/todo")
    public Todo save(@RequestBody Todo todo){
        return service.save(todo);
    }

    @DeleteMapping(value = "api/{id}/todo")
    public void delete(@PathVariable("id") Long id){
        service.delete(id);
    }
}
