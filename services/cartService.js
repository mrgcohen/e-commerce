const httpError = require('http-errors');
const Cart = require('../models/CartModel');
const CartItem = require('../models/CartItemModel');
const Order = require('../models/OrderModel');
const OrderItem = require('../models/OrderItemModel');

module.exports.postCart = async (user_id) => {
    try {
        // create a new cart
        const cart = await Cart.create(user_id);
        
        // check that cart was created
        if (!cart) {
            throw httpError(500, 'Server error creating cart.');
        }

        return { cart }
    } catch(err) {
        throw err;
    }
}

module.exports.getCart = async (cart_id) => {
    try {
        // throw error if no cart_id
        if(!cart_id) {
            throw httpError(400, 'No cart identifier.');
        }

        // throw error if cart not found 
        const cart = await Cart.findById(cart_id);
        if (!cart) {
            throw httpError(404, 'Cart not found.')
        }

        // find all items in cart
        const cartItems = await CartItem.findInCart(cart_id);
        if (!cartItems) {
            throw httpError(404, 'Cart empty.')
        }

        return {
            cart: cart, 
            cartItems: cartItems
        }
    } catch(err) {
        throw err;
    }
}
