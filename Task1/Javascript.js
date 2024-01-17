class Cart {
    constructor() {
        // initializing the products and their prices
        this.catalog = {
            "product A": 20,
            "product B": 40,
            "product C": 50
        };

        // initial cart with no items
        this.cart = {};

        // defining all rules for giving discounts to customers
        this.discountRules = [
            // "flat_10_discount": If the cart total exceeds $200, apply a flat $10 discount on the cart total.
            { "discountName": "flat_10_discount", "cartTotal": 200, "discountPrice": 10 },

            // "bulk_5_discount": If the quantity of any single product exceeds 10 units, apply a 5%
            // discount on that item's total price.
            { "discountName": "bulk_5_discount", "quantityTotal": 10, "discountPercent": 0.05 },

            // "bulk_10_discount": If the total quantity exceeds 20 units, apply a 10% discount on the cart total.
            { "discountName": "bulk_10_discount", "quantityTotalLimit": 20, "discountPercent": 0.1 },

            // "tiered_50_discount": If the total quantity exceeds 30 units & any single product quantity
            // is greater than 15, then apply a 50% discount
            // on products which are above 15 quantity. The first 15 quantities have the original price,
            // and units above 15 will get a 50% discount.
            { "discountName": "tiered_50_discount", "quantityTotalLimit": 30, "limitForSingle": 15, "discountPercent": 0.5 }
        ];

        // shipping fee
        this.shippingFee = 5;

        // gift wrap fee
        this.feeForGiftWrap = 1;

        // units for the package
        this.packageUnits = 10;
    }

    // Method for adding items to the cart
    addingItemsToCart(product, quantity, isGiftWrap) {
        this.cart[product] = { "quantity": quantity, "isGiftWrap": isGiftWrap };
    }

    // Method for calculating the discount based on given rules
    discountCalculate() {
        // calculating the total items using values method
        const totalItems = Object.values(this.cart).reduce((sum, item) => sum + item.quantity, 0);

        for (const rule of this.discountRules) {
            if (rule.cartTotal && totalItems > rule.cartTotal) {
                return { "discountName": rule.discountName, "discountAmount": rule.discountPrice };
            }

            if (rule.quantityTotal && Object.values(this.cart).some(item => item.quantity > rule.quantityTotal)) {
                const discountAmount = Object.entries(this.cart)
                    .filter(([_, item]) => item.quantity > rule.quantityTotal)
                    .reduce((sum, [product, item]) => sum + item.quantity * this.catalog[product] * rule.discountPercent, 0);
                return { "discountName": rule.discountName, "discountAmount": discountAmount };
            }

            if (rule.quantityTotalLimit && totalItems > rule.quantityTotalLimit) {
                const qualifiedProducts = Object.entries(this.cart)
                    .filter(([_, item]) => item.quantity > (rule.limitForSingle || 0))
                    .map(([product]) => product);
                const discountAmount = qualifiedProducts.reduce((sum, product) => sum + this.cart[product].quantity * this.catalog[product] * rule.discountPercent, 0);
                return { "discountName": rule.discountName, "discountAmount": discountAmount };
            }
        }

        return { "discountName": null, "discountAmount": 0 };
    }

    // Method for calculating the total for the customer's cart
    totalCalculate(discountName, discountAmount) {
        // finding the total quantity of the cart
        const quantityTotal = Object.values(this.cart).reduce((sum, item) => sum + item.quantity, 0);

        // finding the subtotal without discount
        const subtotal = Object.entries(this.cart).reduce((sum, [product, item]) => sum + item.quantity * this.catalog[product], 0);
        const discountFinal = discountAmount || 0;

        // finding the shipping fees based on the total quantity of the cart
        const shippingFees = Math.ceil(quantityTotal / this.packageUnits) * this.shippingFee;

        // finding the wrap fees only for the products that are chosen for wrapping
        const giftWrapFees = Object.entries(this.cart).reduce((sum, [product, item]) => {
            if (item.isGiftWrap) {
                return sum + item.quantity * this.feeForGiftWrap;
            }
            return sum;
        }, 0);

        // finally, the total of the cart is the sum of subtotal, shipping fees, gift wrap fee minus the final discount
        const total = subtotal - discountFinal + shippingFees + giftWrapFees;

        return {
            subtotal: isNaN(subtotal) ? 0 : subtotal,
            discountName,
            discountFinal: isNaN(discountFinal) ? 0 : discountFinal,
            shippingFees: isNaN(shippingFees) ? 0 : shippingFees,
            giftWrapFees: isNaN(giftWrapFees) ? 0 : giftWrapFees,
            total: isNaN(total) ? 0 : total
        };
    }

    // Method for displaying the receipt for the cart with all the details
    receiptDisplay() {
        for (const [product, item] of Object.entries(this.cart)) {
            console.log(`Product Name: ${product}, Quantity: ${item.quantity}, Total Amount: ${item.quantity * this.catalog[product]}`);
        }

        const { discountName, discountAmount } = this.discountCalculate();
        const { subtotal, discountName: discountNameFinal, discountFinal, shippingFees, giftWrapFees, total } = this.totalCalculate(discountName, discountAmount);

        console.log("\nSubtotal:", subtotal);
        console.log("Discount Applied:", discountNameFinal ? `${discountNameFinal} - ${discountFinal}` : "None");
        console.log("Shipping Fee:", shippingFees);
        console.log("Gift Wrap Fee:", giftWrapFees);
        console.log("Total:", total);
    }
}

// Example usage:
const cart = new Cart();
// Prompt user for input
const productA = "product A";
const enterQuantityForProductA = parseInt(prompt(`Enter Quantity for ${productA}:`), 10);
const requireWrappingA = prompt(`Do you want the gift wrap for ${productA}? (yes/no):`).toLowerCase() === "yes";

const productB = "product B";
const enterQuantityForProductB = parseInt(prompt(`Enter Quantity for ${productB}:`), 10);
const requireWrappingB = prompt(`Do you want the gift wrap for ${productB}? (yes/no):`).toLowerCase() === "yes";

const productC = "product C";
const enterQuantityForProductC = parseInt(prompt(`Enter Quantity for ${productC}:`), 10);
const requireWrappingC = prompt(`Do you want the gift wrap for ${productC}? (yes/no):`).toLowerCase() === "yes";

// Add items to the cart
cart.addingItemsToCart(productA, enterQuantityForProductA, requireWrappingA);
cart.addingItemsToCart(productB, enterQuantityForProductB, requireWrappingB);
cart.addingItemsToCart(productC, enterQuantityForProductC, requireWrappingC);

cart.receiptDisplay();
