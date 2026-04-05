# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables: 
# PYTHONDONTWRITEBYTECODE prevents Python from writing .pyc files
# PYTHONUNBUFFERED ensures our console output is not buffered by Docker
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies (required for PostgreSQL and other C-extensions)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file and install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the entire backend project into the container
COPY . /app/

# Collect static files (used by WhiteNoise for production styling)
RUN python manage.py collectstatic --noinput

# Expose port 8000
EXPOSE 8000

# Start the Django project via Gunicorn, binding to 0.0.0.0 so Render can detect it
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application", "--log-file", "-"]
