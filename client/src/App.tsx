import React, {FC, useContext, useEffect, useState} from 'react';
import LoginForm from "./components/LoginForm";
import {Context} from "./index";
import {observer} from "mobx-react-lite";
import {IUser} from "./models/IUser";
import UserService from "./services/UserService";

const App: FC = () => {
    const {store} = useContext(Context)
    const [users, setUsers] = useState<IUser[]>([])

    useEffect( () => {
        if (localStorage.getItem('token')){
            store.checkAuth()
        }
    }, [])

    async function getUsers(){
        try {
            const response = await UserService.fetchUsers()
            setUsers(response.data)
        } catch (e) {
            console.log(e)
        }
    }

    if (store.isLoading){
        return <div>Loading...</div>
    }

    if(!store.isAuth){
        return (
            <div>
                <LoginForm/>
                <button onClick={getUsers}>View user list</button>
            </div>
        )
    }

    return (
      <div>
          <h1>{store.isAuth ? `User authorized ${store.user.email}` : 'Authorize please'}</h1>
          <h1>{store.user.isActivated ? 'Email confirmed' : 'Please confirm your email!'}</h1>
          <button onClick={() => store.logout()}>Logout</button>
          <div>
              <button onClick={getUsers}>View user list</button>
          </div>
          {users.map(user =>
              <div key={user.email}>{user.email}</div>
          )}
      </div>
  );
}

export default observer(App);
