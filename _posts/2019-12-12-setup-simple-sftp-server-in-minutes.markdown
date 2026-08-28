---
layout: post
author: Henrique A. Lavezzo
author_id: henrique
title:  "Setup simple SFTP server in minutes"
resume: "Creating SFTP like a pro"
date:   2019-12-12 14:25:55 -0300
categories: tech
tags: linux sysadmin sftp
type: scroll
---

> **Historical safety note — reviewed 28 August 2026:** This entry preserves the voice and context of a setup I wrote in 2019, but the original ownership commands were unsafe for an OpenSSH chroot. Every component of `ChrootDirectory` must be owned by root and must not be writable by group or others. The corrected commands below give `partner` write access only to `/files`. Validate the SSH daemon configuration before reloading it, keep an existing administrative session open, and adapt service names and authentication policy to the Ubuntu release you operate. I have reviewed these instructions against the OpenSSH manuals; I have not run this article as an isolated end-to-end server validation.

## Context

One of most common ways to share files between companies is still FTP servers. And sometimes, you need to setup a FTP in-house, whether out compliance control, security, cost, or 'cause its simple enough to do it yourself.

I've one FTP server in company that I work. It's a simple FTP server, developed with Python, using `pyftpdlib` package, and aws S3 integration. We have a hook action, that send file into a folder mirror named bucket, to secure files, and after 15 days, we made a server FS clean, to guarantee healthy disk space level.

But recently, we get a specific trait from new partner, we need to expose an sftp server. In a quick search, `pyftpdlib` does not support sftp protocol. After this, I go to aws services, to see how much cost the use of **AWS Transfer**. It's easy to use service, but expensive for a small startup, and I don't think we need an entire service for this. In other situation, our monthly invoice will be affected by third-party factor, and one mistake made by our partner, could increase the invoice numbers.

Given the above factors, I decided to build a simple sftp from scratch.

## DIY Setup

First of all, you'll need a server instance. In this case, I've used a DigitalOcean Droplet. My decision was driven by low-cost purposes.

I like Ubuntu server instances, and this "paper" uses the assumption the server is a Ubuntu server.

### Packages

Make sure, your instance is updated.

{% highlight bash %}
# apt update && apt upgrade
{% endhighlight %}

Install vim, ~~or use nano~~.

{% highlight bash %}
# apt install vim
{% endhighlight %}

### Create user

You'll need to create a user, for your third-party user. We'll call our friend, as **partner** here. Say hello to **Partner**.

{% highlight bash %}
# adduser --shell /bin/false partner
{% endhighlight %}

You can allow your Linux, to create home folders. But actually, I like to stay in front of situation.

### Create user folder

If you allowed `adduser` to create home folders, then you don't need to create a permitted folder space.

{% highlight bash %}
# install -d -o root -g root -m 0755 /var/sftp/partner
# install -d -o partner -g partner -m 0755 /var/sftp/partner/files
{% endhighlight %}

Remember to guarantee permissions to **Partner** in your *home sweet home*.

The chroot itself must remain root-owned; only the `/files` directory is writable by **Partner**.


### SFTP access restrictions

**Partner** is a common user inside our server. And without other (recommended) security rules, **Partner** will be able to make an ssh connection. And we don't want this.

We'll create a rule at end of file of `sshd_config`, for sftp only restriction.

{% highlight bash %}
# vim /etc/ssh/sshd_config
{% endhighlight %}

The content:

{% highlight bash %}
Match User partner
	ChrootDirectory /var/sftp/partner
	ForceCommand internal-sftp -d /files
	PasswordAuthentication yes
	PermitTTY no
	PermitTunnel no
	AllowAgentForwarding no
	AllowTcpForwarding no
	X11Forwarding no
{% endhighlight %}

`internal-sftp` keeps the transfer service inside `sshd` and starts this user in the writable `/files` directory.

### Validate and reload SSH

Keep an existing administrative session open. Validate the daemon configuration first; only reload the service if validation succeeds.

{% highlight bash %}
# /usr/sbin/sshd -t
# systemctl reload ssh
{% endhighlight %}

The `-t` command checks the configuration syntax and key sanity. Reloading applies a valid configuration without needlessly terminating established connections.


### Create password

Create a password for partner if didn’t create one yet.

{% highlight bash %}
# passwd partner
{% endhighlight %}

### Testing sftp server

#### SFTP Connection
For sftp connection, try to connect in your server with **partner** credentials.

{% highlight bash %}
$ sftp partner@your-sftp-server
{% endhighlight %}

Type password, and if everything is alright, you'll enter inside **partner** sftp home folder.

#### SSH Connection

**Partner** should has access only to sftp and no ssh connections should be allowed. The test is simple, just try to connect with SSH.

{% highlight bash %}
$ ssh partner@your-sftp-server
{% endhighlight %}


Type password, hit enter. And you expect to receive this warning message.

{% highlight bash %}
This service allows sftp connections only.
Connection to your-sftp-server closed.
{% endhighlight %}


----

After this, you can send the **partner** credentials to **Partner**. :joy:

This "tutorial" has the purpose to show a simple way to build an sftp server using only Linux resources. As you can see, this "tutorial" doesn't go deep inside major security efforts. But, you can easily enforce your security, using Linux resources too, or using the service providers (aws, Digital Ocean, etc) tools.

## Sources and boundaries

The chroot ownership rule, `Match` directives, and `internal-sftp` behavior are documented in the OpenSSH [`sshd_config` manual](https://man.openbsd.org/sshd_config). Configuration validation is documented in the OpenSSH [`sshd` manual](https://man.openbsd.org/sshd).

This small password-authentication example does not cover key-only authentication, firewall policy, intrusion monitoring, backups, high availability, or a complete operating-system hardening review.
