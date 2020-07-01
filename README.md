# Asterisk sandbox for a single user

## Description and features of this project

I wanted to learn Asterisk, to be able to "take my homeline with me anywhere" (including on my cell phone or when away), and have a project that I could configure to my taste. This project solves exactly that.

**Key features:**

- Readymade asterisk config ; only setup your VoipMS account, forward the NAT ports, create the config file and run one command. All steps are explained below.
- Currently (at the time of writing this) working asterisk features: voicemail, voicemail MWI (blinking light on phone/softphone when there is an unread voicemail message), music on hold, SMS (via _SIP MESSAGE_ though, not _SIP SIMPLE_ ; my VoIP provider doesn't use _SIP SIMPLE_!), go straight to voicemail past a certain time, ...
- Some comments explain why things are done the way they are. This way you can use this project to learn the basics of VoIP with Asterisk like I did.
- (Experimental) An Asterisk Manager Interface (AMI) client. While some endpoints (e.g. a cell phone) are not registered, this client buffers the SMS messages. It sends the missed messages to them once the enpoints register to Asterisk. This client is a systemd unit for robustness.
- MIT license: use/modify this project as you like as long as you keep the copyright. Please let me know (a.dentinger@gmail.com) if you use it though ; it will look good on my résumé! :)

**Limitations:**

- This project is not intended to have more than one user ; it is only intended to have multiple phones/softphones belonging to one user.
- I essentially "made my configuration public", so I did not build a way to disable some features. For example, there is no direct way not to use VoipMS without modifying this project's files. It's not difficult to do when you know where to do it (e.g., just delete some stuff in `pjsip.conf` to disable VoipMS stuff), but it's not direct.
- I have a few minor bugs with the AMI client. See [my issues tagged "AMI Client"](https://github.com/AnthonyD973/AsteriskSingleUserSandbox/issues?q=is%3Aissue+is%3Aopen+label%3A%22AMI+Client%22++user%3AAnthonyD973).
- If we want to actually place or receive calls from "real" phones, we will need a VoIP provider. I transferred my regular home phone number to [VoipMS](https://voip.ms/), so this project is configured for VoipMS. However, as I learned while working on this project, each VoIP provider works differently because the SIP protocol allows for multiple ways to connect to a VoIP server. So you will probably have to look at your provider's website about how to configure `pjsip.conf` (*"chan_pjsip"*) to work with your provider and modify this project's `pjsip.conf` file. Additionally, some providers only show how to configure the old `sip.conf` (*"chan_sip"*), in which case you will have to convert the `sip.conf` configuration to `pjsip.conf`.

## How to use this project

### 1. Preparing the VoipMS account

If you're like me, you'll probably find this Git repo 5 years from when I am writing this, and everything will look different by then. Still, I'll show how to prepare our VoipMS account to support this project, and explain what the various settings do. This might help you adapt to what it looks like now, or show how to do this for another VoIP provider, although it might be tedious to do so if you don't know much about how to configure Asterisk.

The steps to configure our VoipMS account will _look_ quite long because of all the screenshots and because I explain what the options do, but it's really no big deal :) .

#### Create VoipMS account and get a number

First, we should 1) create a VoipMS account, 2) put some money on our account and 3) get a DID number ("phone number") (or port your existing phone number to VoipMS, but I'd suggest testing this project out first).

#### Account settings

Once that's done, go to _Account Settings_.

![Where to find Account Settings](my-data/README_img/AccountSettings.png "Where to find Account Settings")

Under the _Account Routing_ tab, we have the option of carrying voice data using the "Value" (less costly) option or the "Premium" (more reliable) option. Choose which ever one you like ; I chose "Value" because I have never had problems with it. **Don't forget to click "Apply All"!**

![Account Settings > Account Routing page](my-data/README_img/AccountSettings-AccountRouting.png "Account Settings > Account Routing page")

Now, under the _General_ tab, select _I use a system capable of passing its own CallerID_. This settings means that the CallerID (the name that phones we call will display) will be provided by our Asterisk server, rather than setting it on VoipMS's web interface. **Don't forget to click "Apply All"!**

![Account Settings > General page](my-data/README_img/AccountSettings-General.png "Account Settings > General page")

Under the _Inbound Settings_ tab, we should specify we wish to use the _SIP_ protocol, and that our SIP device is "_IP PBX Server, Asterisk or Softswitch_". These settings tell VoipMS that we are a server and not a phone/softphone, and that we want VoipMS to establish calls with our device using the SIP protocol. **Don't forget to click "Apply All"!**

![Account Settings > Inbound Settings page](my-data/README_img/AccountSettings-InboundSettings.png "Account Settings > Inbound Settings page")

Under the _Advanced tab_, we should make sure _NAT_ is set to _yes_, since I assume your server will be behind a NAT. Setting to _yes_ does not hurt even if your server is not behind a NAT anyway. This setting should resolve problems where calls from a "real" phone number using VoipMS do work, but our Asterisk server can't receive the audio from VoipMS, VoipMS can't receive audio from our Asterisk server, or both. (Note that this _doesn't_ fix NAT audio transmission problems between _our phone_ and our Asterisk server ; the port forwarding (explained later) and some of the configuration in `pjsip.conf` fix that.)

Still under the _Advanced tab_, also activate some of the codecs. If you're unsure which codecs to choose, only check _G.711U_ (which is the µ-law/ulaw/mulaw codec). The audio codecs are essentially the formats to use to send/receive the audio. In case you are interested, I found [this video tutorial on codecs useful when making this project](https://www.youtube.com/watch?v=O7feTItIs0s&list=PLnzEbgyK52Gu9fdVDHburrsG3KBIntXFK&index=37). **Don't forget to click "Apply All"!**

![Account Settings > Advanced page](my-data/README_img/AccountSettings-Advanced.png "Account Settings > Advanced page")

#### SIP URI creation

VoipMS requires us to "create" a URI that points to our server.  Once we'll configure our DID number ("phone number"), we'll have the option of selecting that URI as where to send calls to our Asterisk server. I guess other VoIP providers might allow you to specify the SIP URI as you configure the DID number, rather than having to create it ahead of time.

To do this, go to SIP URIs as shown below.

![Where to find SIP URIs](my-data/README_img/SipUris.png "Where to find SIP URIs")

Once there, click the _"Add SIP URI"_ button. Specify `voipms@<domain_name>:<port>`, where `<domain_name>` is our Asterisk server's domain name, subdomain name or IP address, and `<port>` is the UDP port number of Asterisk's SIP server. If you have no reason not to, use `5060` for `<port>` (or even don't specify `:<port>` at all, since port 5060 is the default). If you want a free subdomain name, go to https://www.noip.com/, get one for free and configure your router for Dynamic DNS using the domain name, username and password you provided. That's what I did :) . I'm sorry if it's confusing when I explain it, but that's how it works :) .

Note that, as the screenshot below shows, I personally have two SIP URIs. We only really need one, though.

![SIP URIs > Adding a SIP URI](my-data/README_img/SipUris-Add.png "SIP URIs > Adding a SIP URI")

#### DID configuration

Finally, we must configure the DID number ("phone number") we got from VoipMS. Go to _Manage DID(s)_.

![Where to find Manage DID(s)](my-data/README_img/ManageDids.png "Where to find Manage DID(s)")

Edit the DID number you got from VoipMS. Note that, as the screenshot below shows, I personally have two DID numbers since I got one from VoipMS and later ported my "real" phone number over to VoipMS, but you only need one number.

![Manage DID(s) > Edit DID](my-data/README_img/ManageDids-EditDid.png "Manage DID(s) > Edit DID")

Once there, under _Routing_, we should choose _SIP URI_ and select the SIP URI we created a moment ago. This tells VoipMS to send incoming calls (and SMS messages) to that server.

![Manage DID(s) > Edit DID > Choose SIP URI](my-data/README_img/ManageDids-EditDid-1.png "Manage DID(s) > Edit DID")

Next, under _DID Point of Presence_, choose a region and server that is close to your location. This is the VoipMS server that will send calls to our Asterisk server. Note that the configuration file (explained later) will need the URL of that server, so, if you chose `montreal.voip.ms`, you will need to specify that later in the configuration file.

Below _DID Point of Presence_, also make sure that _"Ring time in seconds"_ is set to a fairly high value (I chose 60sec). This is the maximum amount of time the VoipMS server will leave callers ringing until hanging up. If this value is small, our phones will ring but our Asterisk server won't have the time to go to voicemail because the VoipMS server will hangup the call before we could go to voicemail.

![Manage DID(s) > Edit DID > Choose DID POP and ring time](my-data/README_img/ManageDids-EditDid-2.png "Manage DID(s) > Edit DID > Choose DID POP and ring time")

Finally, to enable SMS messages, check the _"Enable SMS/MMS"_ box. Note that, at the time of writing this, SMS messages with VoipMS are free because it's apparently a new/experimental feature of VoipMS. We should also choose our main account as _SMS SIP Account_. The _"SMS/MMS email address"_ is not necessary ; it only means VoipMS sends us an email every time we receive an SMS message.

**Don't forget to click the button to apply changes!**

![Manage DID(s) > Edit DID > Enable SMS messages](my-data/README_img/ManageDids-EditDid-3.png "Manage DID(s) > Edit DID > Enable SMS messages")

### 2. Preparing the network

This project configures Asterisk to use SIP (for registering, starting calls, etc.) and RTP (for the actual voice data). If we want to actually place/receive calls from VoipMS, or even if we want to be able to use a phone/softphone outside of home, we will need to forward some NAT ports on our home router:

- One UDP port for SIP signalling ; use UDP port 5060 if you have no reason not to.
- About 100 UDP ports for RTP ; e.g. UDP 18000-18099.

If you don't know what NAT port port forwarding is or how to do it, search something like _NAT port forwarding_ on the internet. Most home routers have a web interface that you can access from your browser by typing the routers IP address (e.g. `192.168.0.1` on some routers). You can do the port forwarding there. If you don't know the router's username/password, there usually is a reset button on the router to reset it back to factory settings and factory username/password.

Notes:

- Take note of which ports you forwarded ; you will need to specify them in the configuration file (explained below).
- If you are running the Asterisk server in a VM, you need to also make sure the ports are forwarded from the host to the VM. I haven't done it, but you will need to either 1) make sure the VM is either NATted or bridged to the host *and* that you forward these ports to the VM, or 2) enable a physical connection from the VM to the network (which I think requires trifling with BIOS and kernel boot arguments). The idea is similar if you run this project inside a container you made.
- If your NAT is a full-cone NAT, you probably won't need to forward the RTP ports because I configured a STUN server in the Asterisk config files. If you don't know what I'm talking about, don't worry about it anyway.
- Obviously, if you put the Asterisk server in your DMZ, there is no need to forward anything. But if you know what I'm talking about, then you probably don't need *me* to tell you this!

### 3. Creating config file

At this point, we should create a copy the file `sample/config-file-template.txt` and fill in the missing variable values. Run `./update.sh --help` for an explanation of each variable.

Note that, like many other projects, it's possible that `sample/config-file-template.txt` is no longer up-to-date at the time you read this. Run `./update.sh --help` for an up-to-date list of variables to set.

### 4. Actually installing and setup everything

To **erase** the current Asterisk configuration and use this repo's configuration, run as root:

```bash
./update.sh install --conf /your/config/file
```

...where `/your/config/file` is the config file you created in the preceding step.

Notes:

- You will need the `ffmpeg` program in your `PATH` if you specify in the config file formats other than WAV (e.g. `SOUNDS_FORMATS=wav|ulaw`). On Ubuntu 18.04, I installed `ffmpeg` with the command `sudo apt install ffmpeg`.
- Even though the `update.sh` script gives the impression that it can create a Docker container to run this project in, it's been a while that I tested it, so I'm not sure if it works.
- The time range that Asterisk uses to go straight to voicemail past a certain time is the system's time, so make sure you have the correct timezone configured on your system. Run the `date` command to tell if that is the case. To change your server's timezone, use the server's GUI if you have a GUI installed, or run a command to do so. Under Ubuntu 18.04, I used the `dpkg-reconfigure tzdata` command to change my server's timezone.

### 5. Configuring our phones/softphones

From now on, our Asterisk server is up and ready! It will stay up even if we reboot our server, if it powers off due to a power failure, etc., so it's really completely setup.

All we really need now is to actually setup phones to connect to Asterisk. This of course depends on your phone's user interface, so let's give the example of the Zoiper softphone. Other IP phones or softphones will have very similar requirements, but they might be presented differently.

First, go to Zoiper's settings, then click _Accounts_ and click _Add_.

![Zoiper main screen](my-data/README_img/Zoiper-Main.png "Zoiper main screen")

![Zoiper SIP accounts](my-data/README_img/Zoiper-CreateSipAccount.png "Zoiper SIP accounts")

Now specify which SIP URI to register to. What we write here should look like `<aor>@<domain_name>:<port>`, where:

- `<aor>` is one of the AORs in `pjsip.conf` (`linux` in my case).
- `<domain_name>` is our Asterisk server's domain name, subdomain name or IP address _compared to where the computer running Zoiper currently is_. If you are on the same network as the server, you will probably have to use the server's private IP address, which you can obtain by running the `ip addr` command on the server. If you are outside of home, this is the same `<domain_name>` as what you specified earlier when setting up your VoipMS server. This also means you will need to change the server's domain name if you leave home or if you had left home but are now back home. The reason for this is that [home routers usually don't support sending packets to their own public IP address from inside the network](https://stackoverflow.com/a/40229684/2252948).
- `<port>` is the UDP port number of Asterisk's SIP server. This must be the same port as you specified earlier when setting up the VoipMS account.

We should also specify the password of the AOR we set in the configuration file earlier. Run `./update.sh --help` for a correspondance between each AOR and the `ENDPOINT*_PASSWORD` values of the configuration file. In the case of AOR `linux`, the password is the value you set for `ENDPOINT1_PASSWORD`.

![Zoiper registering step 1](my-data/README_img/Zoiper-CreateSipAccount-1.png "Zoiper registering step 1")

The next screen should already have the required information because we specified it in the last screen. It's the hostname (`<domain_name>:<port>`) of our Asterisk server.

![Zoiper registering step 2](my-data/README_img/Zoiper-CreateSipAccount-2.png "Zoiper registering step 2")

Not sure what the next screen is for ; I don't think it's useful in our context anyway. Just skip it.

![Zoiper registering step 3](my-data/README_img/Zoiper-CreateSipAccount-3.png "Zoiper registering step 3")

On the next screen, Zoiper should be trying to find what kind of server it is connecting with (SIP server over UDP in our case, not SIP over TLS, nor SIP over TCP, nor IAX over UDP).

![Zoiper registering step 4](my-data/README_img/Zoiper-CreateSipAccount-4.png "Zoiper registering step 4")

Zoiper should now be connected to Asterisk ; we can try to setup a second IP phone/softphone and call ourself by dialling whatever we specified as `MAIN_EXTEN` in the configuration file earlier.

![Zoiper registering step 5](my-data/README_img/Zoiper-CreateSipAccount-5.png "Zoiper registering step 5")

Depending on your phone/softphone, you can configure it further. With the pro version of Zoiper (that I bought), you can specify what extension your VoicemailMain (extension number to check your messages) is, and what extension to transfer people to if you answered the call but later want them to leave you a message. I've noticed other IP phones/softphones have similar features. Once again, the VoicemailMain extension is `*<MAIN_EXTEN>`, and the "leave voicemail message" extension is `**<MAIN_EXTEN>`.

![Zoiper registering step 6](my-data/README_img/Zoiper-CreateSipAccount-6.png "Zoiper registering step 6")
