import './App.css';
import Auth from './authPage/Auth';
import './authPage/Auth.css';
import Header from './header/Header';
import './header/Header.css';
import {Provider} from 'react-redux';
import store from './redux/store';

function App() {
  return (
    <Provider store={store}>
      <div>
        <Header/>
        <Auth/>
      </div>
    </Provider>
  );
}

export default App;
