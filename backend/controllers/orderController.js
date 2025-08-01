import axios from "axios";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";

//create order api
export const createOrder = async (req, res) => {
    const userId = req.user.id;
    const { products, shippingAddress, phoneNumber, totalAmount, paymentMethod, orderStatus } = req.body;

    console.log("ShippingAddress : ", shippingAddress)

    if (!userId) {
        return res.status(400).json({ message: "User not found" });
    }
    //array products.length
    if (!products || products.length == 0 || !shippingAddress, !phoneNumber, !totalAmount, !paymentMethod, !orderStatus) {
        return res.status(400).json({ message: "All field are required" });
    }

    const orderData = await Order.create({
        userId,
        products,
        phoneNumber,
        totalAmount,
        paymentMethod,
        shippingAddress,
        orderStatus
    })

    // payment vana collection ma  data saved garna 
    const paymentData = await Payment.create({ userId, paymentMethod, totalAmount, orderId: orderData.id, paymentStatus: "pending", });

    //
    if (paymentMethod === 'khalti') {
        const khaltiPayload = {
            return_url: "http://localhost:3000/success/",
            website_url: "https://localhost:5173",
            amount: totalAmount * 100,
            purchase_order_id: orderData.id,
            purchase_order_name: "test",
        }

        const khaltiResponse = await axios.post(
            'https://dev.khalti.com/api/v2/epayment/initiate/', khaltiPayload,
            {
                headers: {
                    Authorization: 'key bd2b92f5a5f64b4b91089e2d1d1e08d9',
                }
            }
        )


        //update payment record with pidx
        paymentData.pidx = khaltiResponse.data.pidx;
        await paymentData.save();
        res.status(200).json({ message: "Order places succcessfully, Redirect to khalti", url: khaltiResponse.data.payment_url, order: orderData });
    }
}


//get all the order
export const getAllOrders = async (req, res) => {
    const orders = await Order.find();
    res.status(200).json({ message: "Successfully get  my orders", data: orders })
}


//get single order
export const getSingleOrder = async (req, res) => {
    // const {id}=req.params;
    const orders = await Order.findById(req.params.id);
    if (!orders) {
        return res.status(404).json({ message: "Order cannot be null" });
    }
    res.status(200).json({ message: "Successfully get the single order", data: orders })
}


//get my orders
export const getMyOrder = async (req, res) => {
    const userId = req.user.id;
    const orders = await Order.find({ userId });
    if (orders.length === 0) {
        return res.status(404).json({ message: "Order cannot be null" });
    }
    res.status(200).json({ message: "Successfully get  my orders", data: orders })
}


//admin update orderstatus
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    console.log("Id : ", id)
    const { orderStatus } = req.body;

    console.log("OrderStatus", orderStatus)
    const orders = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true });
    res.status(200).json({ message: "Successfully update the order", data: orders })

}

// delete order
export const deleteOrder = async (req, res) => {
    const { id } = req.params;
    const orders = await Order.findByIdAndDelete(id);
    if (!orders) {
        return res.status(404).json({ message: "Order cannot be null" });
    }
    res.status(200).json({ message: "Successfully delete the order" })
}


//cancel order
export const cancleOrder = async (req, res) => {
    const { id } = req.params;
    const orders = await Order.findById(id);
    if (!orders) {
        return res.status(404).json({ message: "Order not found" })
    }

    if (orders.orderStatus === "pending") {
        orders.orderStatus = "cancalled";
        await orders.save();
    } else {
        return res.status(404).json({ message: "Order must be pending for the cancellation" })
    }

    res.status(200).json({ message: "Successfully change the order status", hello: orders })

}