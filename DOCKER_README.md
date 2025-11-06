# Despliegue con Docker en Proxmox

## Requisitos previos

1. **Proxmox** instalado y configurado
2. **Contenedor LXC** o **VM** con:
   - Ubuntu 22.04 LTS o superior
   - Docker Engine
   - Docker Compose
   - Al menos 2GB RAM
   - 20GB de almacenamiento

## Instalación de Docker en Proxmox

### Opción 1: LXC Container (Recomendado)

```bash
# Crear contenedor LXC en Proxmox
pct create 100 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname muebles-app \
  --memory 2048 \
  --cores 2 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --rootfs local-lvm:20

# Iniciar contenedor
pct start 100

# Acceder al contenedor
pct enter 100

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y
```

### Opción 2: VM

```bash
# Crear VM con Ubuntu 22.04
# Luego dentro de la VM:

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose -y

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

## Despliegue de la aplicación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/proyecto-muebles.git
cd proyecto-muebles
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar archivo .env
nano .env
```

Configurar:
```env
MONGO_ROOT_PASSWORD=tu_password_seguro_aqui
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro
VITE_API_URL=http://TU_IP_PROXMOX:5000
```

### 3. Construir e iniciar servicios

```bash
# Opción 1: Con script
chmod +x start.sh
./start.sh

# Opción 2: Manual
docker-compose build
docker-compose up -d
```

### 4. Verificar servicios

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

## Acceso a la aplicación

Una vez iniciado, accede a:

- **Frontend**: `http://IP_DE_TU_PROXMOX:80`
- **Backend API**: `http://IP_DE_TU_PROXMOX:5000`
- **MongoDB**: `IP_DE_TU_PROXMOX:27017`

## Comandos útiles

### Gestión de servicios

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Ver logs en tiempo real
docker-compose logs -f

# Actualizar servicios
git pull
docker-compose build
docker-compose up -d
```

### Backup y restauración

```bash
# Backup de MongoDB
docker-compose exec -T mongodb mongodump \
  --uri="mongodb://admin:PASSWORD@localhost:27017/muebles_db?authSource=admin" \
  --archive > backup_$(date +%Y%m%d).dump

# Restaurar MongoDB
docker-compose exec -T mongodb mongorestore \
  --uri="mongodb://admin:PASSWORD@localhost:27017/muebles_db?authSource=admin" \
  --archive < backup_20250129.dump
```

### Mantenimiento

```bash
# Ver uso de recursos
docker stats

# Limpiar contenedores detenidos
docker system prune -a

# Ver volúmenes
docker volume ls

# Backup completo de volúmenes
docker run --rm -v muebles_mongodb_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mongodb_backup.tar.gz /data
```

## Configuración de red en Proxmox

### Exponer puertos al exterior

En el nodo de Proxmox, configurar port forwarding:

```bash
# Editar /etc/network/interfaces o usar GUI de Proxmox

# Redirigir puerto 80 del host al contenedor
iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to IP_CONTENEDOR:80
iptables -t nat -A POSTROUTING -j MASQUERADE
```

### Usar dominio personalizado

1. Configurar DNS para apuntar a tu IP de Proxmox
2. Actualizar `VITE_API_URL` en `.env`:
   ```env
   VITE_API_URL=https://api.tudominio.com
   ```
3. Configurar SSL con Let's Encrypt (ver sección SSL)

## SSL/HTTPS con Let's Encrypt

### Opción 1: Nginx Proxy Manager (Recomendado)

```bash
# Agregar a docker-compose.yml
nginx-proxy-manager:
  image: 'jc21/nginx-proxy-manager:latest'
  restart: unless-stopped
  ports:
    - '80:80'
    - '81:81'
    - '443:443'
  volumes:
    - ./data:/data
    - ./letsencrypt:/etc/letsencrypt
```

Acceder a `http://TU_IP:81` para configurar proxy y SSL.

### Opción 2: Certbot manual

```bash
# Instalar certbot
apt install certbot python3-certbot-nginx

# Obtener certificado
certbot --nginx -d tudominio.com -d www.tudominio.com
```

## Monitoreo

### Agregar Portainer

```yaml
# Agregar a docker-compose.yml
portainer:
  image: portainer/portainer-ce:latest
  container_name: portainer
  restart: unless-stopped
  ports:
    - "9000:9000"
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - portainer_data:/data
```

Acceder a `http://TU_IP:9000`

## Troubleshooting

### Problema: MongoDB no inicia

```bash
# Ver logs
docker-compose logs mongodb

# Verificar permisos de volumen
docker volume inspect muebles_mongodb_data

# Recrear volumen
docker-compose down -v
docker-compose up -d
```

### Problema: Frontend no conecta con Backend

```bash
# Verificar variable de entorno
docker-compose exec frontend env | grep VITE

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Problema: Puerto ocupado

```bash
# Ver qué proceso usa el puerto
netstat -tulpn | grep :80

# Cambiar puerto en docker-compose.yml
ports:
  - "8080:80"  # Usar 8080 en lugar de 80
```

## Seguridad

### Recomendaciones

1. **Cambiar passwords** por defecto en `.env`
2. **Usar firewall** (ufw o iptables)
3. **Habilitar SSL/HTTPS** en producción
4. **Restringir acceso** a MongoDB desde exterior
5. **Actualizar regularmente** las imágenes Docker

### Configurar firewall

```bash
# UFW
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## Actualización de la aplicación

```bash
# 1. Hacer backup
docker-compose exec -T mongodb mongodump --archive > backup.dump

# 2. Obtener últimos cambios
git pull

# 3. Rebuild
docker-compose build

# 4. Reiniciar servicios
docker-compose down
docker-compose up -d

# 5. Verificar
docker-compose ps
docker-compose logs -f
```

## Soporte

Para problemas o preguntas:
- GitHub Issues: https://github.com/tu-usuario/proyecto-muebles/issues
- Email: soporte@tudominio.com