from django.db import models


class Order(models.Model):
    STATUS_CHOICES = [
        ("new", "New"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
    ]

    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=50)
    email = models.EmailField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")

    total_qty = models.PositiveIntegerField(default=0)
    total_sum = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product_id = models.PositiveIntegerField()
    title = models.CharField(max_length=500)

    color_id = models.PositiveIntegerField(null=True, blank=True)
    color_name = models.CharField(max_length=120, null=True, blank=True)

    qty = models.PositiveIntegerField()
    price = models.PositiveIntegerField()
    total = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.title} × {self.qty}"
