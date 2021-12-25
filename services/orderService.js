const httpError = require('http-errors');
const Order = require('../models/OrderModel');
const OrderItem = require('../models/OrderItemModel');
const Cart = require('../models/CartModel');
const CartItem = require('../models/CartItemModel');
const Product = require('../models/ProductModel');

module.exports.postOrder = async (data) => {
    try {
        // throw error if no cart_id
        if(!data.cart_id) {
            throw httpError(400, 'No cart identifier.');
        }

        // throw error if cart not found
        const cart = await Cart.findById(data.cart_id);        
        if (!cart) {
            throw httpError(404, 'Cart not found.')
        }

        // find all items in cart
        const cartItems = await CartItem.findInCart(data.cart_id);
        if (!cartItems) {
            throw httpError(404, 'Cart empty.')
        }

        // calculate order total 
        var total = 0;
        for (const cartItem of cartItems) {
            // grab item product
            const price = await Product.getPrice(cartItem.product_id);

            // throw error if missing
            if(!price) throw httpError(404, 'Product missing');

            total += cartItem.quantity * price.price;
        }

        // create an new order
        const newOrder = await Order.create({ 
            user_id: data.user_id,
            shipping_address_id: data.shipping.address.id,
            billing_address_id: data.billing.address.id, 
            payment_id: data.payment.id, 
            total: total
        });

        // iterate through cart items to create order items
        var orderItems = []; 
        for (const cartItem of cartItems) {
            // create new order item 
            const newOrderItem = await OrderItem.create({ ...cartItem, order_id: newOrder.id });
            
            // delete cart item from database
            const deletedCartItem = await CartItem.delete({ ...cartItem });

            // add item to order items
            orderItems.push(newOrderItem);
        }

        // delete cart from database
        const deletedCart = await Cart.delete(data.cart_id);

        // ---------------------------------------------------------
        // --- charge Card associated with payment_id the total ----
        // ---------------------------------------------------------

        return {
            order: newOrder, 
            orderItems: orderItems,
        };
        
    } catch(err) {
        throw err;
    }
}

module.exports.getAllOrders = async (user_id) => {
    try {
        // find orders assocaited with user_id
        const orders = await Order.findByUserId(user_id);

        return { orders };

    } catch(err) {
        throw err;
    }
}

module.exports.getOneOrder = async (data) => {
    try {
        if (!data.order_id) {
            throw httpError(400, 'No order id');
        }

        // find order
        const order = await Order.findById(data.order_id);

        // throw error if order doesn't exist
        if(!order) {
            throw httpError(404, 'Order not found');
        }

        // throw error if user did not place order
        if(order.user_id !== data.user_id) {
            throw httpError(403, 'User did not place order');
        }

        // find order items
        const orderItems = await OrderItem.findInOrder(data.order_id);

        return { order, orderItems };

    } catch(err) {
        throw err;
    }
}