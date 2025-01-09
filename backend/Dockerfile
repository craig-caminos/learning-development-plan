# Use lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# We'll keep this minimal for now as we're using Supabase
# and don't need much backend processing

# Expose port 3001 (different from frontend)
EXPOSE 3001

# Keep container running
CMD ["tail", "-f", "/dev/null"]