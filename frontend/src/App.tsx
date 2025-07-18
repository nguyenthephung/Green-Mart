import { CartProvider } from './reduxSlice/CartContext';
import { UserProvider } from './reduxSlice/UserContext';
import AppRouter from './router/AppRouter';

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </UserProvider>
  );
}

export default App;
