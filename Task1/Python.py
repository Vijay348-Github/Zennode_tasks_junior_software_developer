class Cart:
    def __init__(self):
        # initialising the products and their prices
        self.catalog = {
            "product A": 20,
            "product B": 40,
            "product C": 50
        }
        # initial cart with no items
        self.cart = {}
        # defining all rules for giving the discounts to the customers
        self.discount_rules = [
            # "flat_10_discount": If cart total exceeds $200, apply a flat $10 discount on the cart total.
            {"discount_name": "flat_10_discount", "cart_total": 200, "discount_price": 10},

            # "bulk_5_discount": If the quantity of any single product exceeds 10 units, apply a 5%
            # discount on that item's total price.
            {"discount_name": "bulk_5_discount", "quantity_total": 10, "discount_percent": 0.05},

            # "bulk_10_discount": If total quantity exceeds 20 units, apply a 10% discount on the cart total.
            {"discount_name": "bulk_10_discount", "quantity_total_limit": 20, "discount_percent": 0.1},

            # "tiered_50_discount": If total quantity exceeds 30 units & any single product quantity
            # greater than 15, then apply a 50% discount
            #  on products which are above  15 quantity. The first 15 quantities have the original price
            #  and units above 15 will get a 50% discount.
            {"discount_name": "tiered_50_discount", "quantity_total_limit": 30, "limit_for_single": 15,
             "discount_percent": 0.5}
        ]
        # shipping fee
        self.shipping_fee = 5
        # gift wrap fee
        self.fee_for_gift_wrap = 1
        # units for package
        self.package_units = 10

    # Method for adding items to cart
    def adding_items_to_cart(self, product, quantity, is_gift_wrap):
        self.cart[product] = {"quantity": quantity, "is_gift_wrap": is_gift_wrap}

    # Method for calculating the discount based on given rules
    def discount_calculate(self):
        # calculating the total items using values method
        total_items = sum(item["quantity"] for item in self.cart.values())
        for rules in self.discount_rules:
            if rules.get("cart_total") and sum(item["quantity"] for item in self.cart.values()) > rules["cart_total"]:
                return rules["discount_name"], rules["discount_price"]

            if rules.get("quantity_total") and any(item["quantity"] > rules["quantity_total"] for item in self.cart.values()):
                return rules["discount_name"], sum(item["quantity"] * self.catalog[product] * rules["discount_percent"] for product, item in self.cart.items())

            if rules.get("quantity_total_limit") and total_items > rules["quantity_total_limit"]:
                products_for_shipping = [product for product, item in self.cart.items() if item["quantity"] > rules.get("limit_for_single", 0)]
                return rules["discount_name"], sum(self.cart[product]["quantity"] * self.catalog[product] * rules["discount_percent"] for product in products_for_shipping)

        return None, 0

    # method for calculating the total for the customer cart
    def total_calculate(self, discount_name, discount_amount):
        # finding the total quantity of the cart
        quantity_total = sum(item["quantity"] for item in self.cart.values())
        # finding the subtotal without discount
        subtotal = sum(item["quantity"] * self.catalog[product] for product, item in self.cart.items())
        discount_final = discount_amount
        # finding the shipping fees based on total quantity of the cart
        shipping_fees = (quantity_total // self.package_units) * self.shipping_fee
        # finding the wra fees if any of the products are choose for wrap
        gift_wrap_fees = sum(item["quantity"] * self.fee_for_gift_wrap for item in self.cart.values())
        # finally the total of the cart is sum of subtotal, shipping fees, gift wrap fee minus final discount
        total = subtotal - discount_final + shipping_fees + gift_wrap_fees
        return subtotal, discount_name, discount_final, shipping_fees, gift_wrap_fees, total

    # method for displaying the receipt for the cart with all the details
    def receipt_display(self):
        for product, item in self.cart.items():
            print(
                f"Product Name: {product}, Quantity: {item['quantity']}, Total Amount: {item['quantity'] * self.catalog[product]}")

        discount_name, discount_amount = self.discount_calculate()
        subtotal, discount_name, discount, shipping_fee, gift_wrap_fee, total = self.total_calculate(discount_name, discount_amount)

        print("\nSubtotal:", subtotal)
        print("Discount Applied:", f"{discount_name} - {discount}" if discount_name else "None")
        print("Shipping Fee:", shipping_fee)
        print("Gift Wrap Fee:", gift_wrap_fee)
        print("Total:", total)


cart = Cart()
# taking input for all the 3 products
productA = "product A"
enter_quantity_for_product_A = int(input("Enter Quantity for product A: "))
require_wrapping_A = bool(input("Do you want the gift wrap for product A: "))

productB = "product B"
enter_quantity_for_product_B = int(input("Enter Quantity for product B: "))
require_wrapping_B = bool(input("Do you want the gift wrap for product B: "))

productC = "product C"
enter_quantity_for_product_C = int(input("Enter Quantity for product C: "))
require_wrapping_C = bool(input("Do you want the gift wrap for product C: "))

cart.adding_items_to_cart(productA, enter_quantity_for_product_A, require_wrapping_A)
cart.adding_items_to_cart(productB, enter_quantity_for_product_B, require_wrapping_B)
cart.adding_items_to_cart(productC, enter_quantity_for_product_C, require_wrapping_C)
cart.receipt_display()