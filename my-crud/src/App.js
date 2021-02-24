import React, { createContext, useContext, useEffect, useReducer, useState, useRef } from 'react';

const HOST_API = "http://localhost:8080/api";

const initialState = {
  list: [],
  item: {},
}

const Store = createContext(initialState);

const Form = () => {

  const formRef = useRef(null);

  const { dispatch, state: { item } } = useContext(Store);

  //Asigna el caracter escrito a state.
  const [state, setState] = useState(item);

  const onAdd = (event) => {
    //Cancela el evento si este es cancelable.
    event.preventDefault();

    const request = {
      name: state.name,
      id: null,
      isCompleted: false,
    }

    fetch(`${HOST_API}/todo`, {
      method: "POST",
      body: JSON.stringify(request), //Convierte request en string.
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then((todo) => {
        dispatch({ type: "add-item", item: todo });//Envia una accion al metodo reduce
        setState({ name: ""});
        formRef.current.reset();
      })
  }

  const onEdit = (event) => {
    event.preventDefault();

    const request = {
      name: state.name,
      id: item.id,
      isCompleted: item.isComplete,
    }

    fetch(`${HOST_API}/todo`, {
      method: "PUT",
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then((todo) => {
        dispatch({ type: "update-item", item: todo });
        setState({ name: "" }); //Vuelve la propiedad nombre del estado a su valor original
        formRef.current.reset(); 
      })
  }

  return <form className="row g-3" ref={formRef}>
    <div className="col-auto">
      <input className="form-control" type="text" name="name" defaultValue={item.name} onChange={(event) => {
        setState({ ...state, name: event.target.value })
      }}>
      </input>
    </div>
    <div className="col-auto">
      {item.id && <button className="btn btn-primary" onClick={onEdit} >Editar</button>}
      {!item.id && <button className="btn btn-primary" onClick={onAdd} >Agregar</button>}
    </div>
  </form>
}

const List = () => {

  const { dispatch, state } = useContext(Store);

  useEffect(() => {
    fetch(`${HOST_API}/todos`)
      .then(response => response.json())
      .then((list) => {
        dispatch({ type: "update-list", list })
      })
  }, [state.list.length, dispatch]);

  const onDelete = (id) => {
    fetch(`${HOST_API}/${id}/todo`, {
      method: "DELETE",
    })
      .then(() => {
        dispatch({ type: "delete-item", id })
      })
  };

  const onEdit = (todo) => {
    dispatch({ type: "edit-item", item: todo })
  }

  return <div>
    <table className="table">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Nombre</th>
          <th scope="col">¿Está Completado?</th>
        </tr>
      </thead>
      <tbody>
        {state.list.map((todo) => {
          return <tr key={todo.id}>
            <td>{todo.id}</td>
            <td>{todo.name}</td>
            <td>{todo.isComplete === true ? "Si" : "No"}</td>
            <td><button className="btn btn-danger" onClick={() => onDelete(todo.id)}>Eliminar</button></td>
            <td><button className="btn btn-success" onClick={() => onEdit(todo)}>Editar</button></td>
          </tr>
        })}
      </tbody>
    </table>
  </div>
};

//Genera las listas dependiendo del case.
function reducer(state, action) {
  switch (action.type) {
    case 'update-item':
      const listEdit = state.list.map((item) => {
        if (item.id === action.item.id) {
          return action.item;
        }
        return item;
      });
      return { ...state, list: listEdit, item: {} }
    case 'delete-item':
      const listUpdate = state.list.filter((item) => {
        return item.id !== action.id;
      });
      return { ...state, list: listUpdate }
    case 'update-list':
      return { ...state, list: action.list }
    case 'edit-item':
      return { ...state, item: action.item }
    case 'add-item':
      const newList = state.list;
      newList.push(action.item);
      return { ...state, list: newList }
    default:
      return state;
  }
}

const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <Store.Provider value={{ state, dispatch }}>
    {children}
  </Store.Provider>
}

function App() {
  return <StoreProvider>
    <Form />
    <List />
  </StoreProvider>
}

export default App;
