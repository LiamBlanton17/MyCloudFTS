from django.db import models

class Company(models.Model):
    id = models.AutoField(primary_key=True)
    company_name = models.CharField(max_length=128)
    is_deleted = models.IntegerField()
    join_date = models.DateTimeField(auto_now_add=True)
    subscription_type = models.IntegerField()

    def __str__(self):
        return self.company_name

class User(models.Model):
    id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    email = models.EmailField(max_length=256)
    user_type = models.IntegerField()  # 1 == lowest, 2 == admin, 3 == owner
    password = models.CharField(max_length=64)  # Ideally, should be hashed in the future
    is_deleted = models.IntegerField()
    join_date = models.DateTimeField(auto_now_add=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
