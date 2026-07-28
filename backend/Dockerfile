# Start from an official Python image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy requirements first (for faster rebuilds)
COPY requirements*.txt ./

# Install dependencies. If a development requirements file exists, prefer it for faster builds.
RUN if [ -f requirements-dev.txt ]; then \
			pip install --no-cache-dir -r requirements-dev.txt; \
		else \
			pip install --no-cache-dir -r requirements.txt; \
		fi

# Copy the rest of the backend code
COPY . .

# Tell the container which port to expose
EXPOSE 8000

# Command to run the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]