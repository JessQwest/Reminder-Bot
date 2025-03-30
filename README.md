# Reminder-Bot
Discord bot allowing to set reminders and repeat reminders with attached actions if desired. Based off the bot by JellyWX: https://gitea.jellypro.xyz/jude/reminder-bot

# Bot Setup
1. Go to the Discord Developer Portal: https://discord.com/developers/applications
2. Set up your own application with a bot. Add the bot to your server and generate a bot token. Note this token down in a safe location.
3. Ensure you have an accessible modern mysql database to connect to. Create a schema (I would suggest `reminders`) within this database

## For running directly:
- Create a file called `.env` in the root directory and within that file type `TOKEN=xxx` replacing the xxx with your bot token
- Modify the `default.yml` file or copy it as `local.yml` and fill in the following information. Filling in debug information is optional
- Compile the typescript and run index.js

## For running through a docker container:
- Compile the docker container via `./build.bat`
- Run the container using a docker compose similar to the following. Environment variables are as specified in `default.yml`, but with . replaced by _ (`server-info.server-id` becomes `server-info_server-id`)

```yaml
  reminderbot:
    image: reminderbot:latest # The container will build as this
    container_name: reminderbot
    environment:
      TOKEN: "xxx" # Substitute your bot token
      database_host: mysql
      database_port: 3306
      database_user: root
      database_password: root
      database_database: reminders
    ports:
      - 3000:3000 # Example: exposes port 3000
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - my-bot-network
      
  mysql:
    image: mysql
    container_name: mysql
    restart: always
    ports:
      - 3306:3306
    environment:
      MYSQL_ROOT_PASSWORD: root 
    healthcheck:
      test: ["CMD", "mysqladmin" ,"ping", "-h", "localhost"]
      timeout: 10s
      retries: 10
    networks:
      - my-bot-network   
    volumes:
      - my-datavolume:/var/lib/mysql

networks:
  my-bot-network:
    name: my-bot-network

volumes:
  my-datavolume:
```