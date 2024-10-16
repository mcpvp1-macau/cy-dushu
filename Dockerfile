FROM registry.cn-hangzhou.aliyuncs.com/jingansi/nginx:1.21.6

RUN bash -c "mkdir -p /home/jingansi/apps/{html,logs,config}"
COPY ./dist /home/jingansi/apps/html

RUN rm -rf .DS_Store */.DS_Store

COPY ./ssl /usr/share/nginx/ssl

COPY ./nginx.conf /etc/nginx

WORKDIR /usr/sbin

EXPOSE 7003

CMD nginx > /home/nohup.log && tail -f /home/nohup.log
