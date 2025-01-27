from django.db import models

# Create your models here.
class User(models.Model):
	id = models.AutoField(primary_key=True)
	first_name = models.CharField(max_length=64)
	last_name = models.CharField(max_length=64)
	email = models.CharField(max_length=256)
	user_type = models.IntegerField()  # 1 == lowest, 2 == admin, 3 == owner
	password = models.CharField(max_length=64)
	is_deleted = models.IntegerField()
	join_date = models.DateTimeField(auto_now_add=True)
	company_id = models.ForeignKey(Company, on_delete=models.CASCADE)

class Company(models.Model):
	id = models.AutoField(primary_key=True)
	company_name = models.CharField(max_length=128)
	is_deleted = models.IntegerField()
	join_date = models.DateTimeField(auto_now_add=True)
	subscription_type = models.IntegerField()