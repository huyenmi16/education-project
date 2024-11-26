from django.db import models

class Report(models.Model):
    user_id= models.IntegerField()  
    courses_id= models.IntegerField()
    day = models.DateTimeField(null=True, blank=True)  
    todo = models.TextField()
    issue = models.TextField()
    plan = models.TextField()

    

    
