from django import forms

class CheckoutForm(forms.Form):
    first_name = forms.CharField(
        label="Імʼя",
        error_messages={"required": "Вкажіть імʼя"},
        widget=forms.TextInput(attrs={"class": "checkout-form__input"}),
    )

    last_name = forms.CharField(
        label="Прізвище",
        error_messages={"required": "Вкажіть прізвище"},
        widget=forms.TextInput(attrs={"class": "checkout-form__input"}),
    )

    phone = forms.CharField(
        label="Телефон",
        error_messages={"required": "Вкажіть номер телефону"},
        widget=forms.TextInput(attrs={"class": "checkout-form__input"}),
    )

    email = forms.EmailField(
        label="Email",
        error_messages={
            "required": "Вкажіть email",
            "invalid": "Вкажіть коректний email",
        },
        widget=forms.EmailInput(attrs={"class": "checkout-form__input"}),
    )

    country = forms.CharField(
        error_messages={"required": "Оберіть країну"},
    )

    delivery_comment = forms.CharField(required=False, widget=forms.Textarea)

    delivery_city = forms.CharField(required=False)
    delivery_warehouse = forms.CharField(required=False)

    delivery_city_name = forms.CharField(required=False)
    delivery_warehouse_name = forms.CharField(required=False)
    country_name = forms.CharField(required=False)

    intl_city = forms.CharField(required=False)
    intl_postcode = forms.CharField(required=False)
    intl_street = forms.CharField(required=False)

    def clean(self):
        cleaned = super().clean()
        country = cleaned.get("country")

        if country == "UA":
            if not cleaned.get("delivery_city"):
                self.add_error("delivery_city", "Оберіть місто")
            if not cleaned.get("delivery_warehouse"):
                self.add_error("delivery_warehouse", "Оберіть відділення")
        else:
            if not cleaned.get("intl_city"):
                self.add_error("intl_city", "Вкажіть місто")
            if not cleaned.get("intl_postcode"):
                self.add_error("intl_postcode", "Вкажіть поштовий індекс")
            if not cleaned.get("intl_street"):
                self.add_error("intl_street", "Вкажіть адресу")

        return cleaned