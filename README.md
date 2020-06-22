# AsteriskConfig

## Description and features of this project

I wanted to learn Asterisk, to be able to "take my homeline with me anywhere" (including on my cell phone or when away), and have a project that I could configure to my taste. This project solves exactly that.

**Key features:**

- Readymade asterisk config ; only forward the NAT ports, create the config file (explained below) and run one command (also explained below).
- Currently (at the time of writing this) working asterisk features: voicemail, voicemail MWI (blinking light on phone/softphone when there is an unread voicemail message), music on hold, SMS (via _SIP MESSAGE_ though, not _SIP SIMPLE_ ; I didn't know _SIP SIMPLE_ existed!), go straight to voicemail past a certain time, ...
- Some comments explain why things are done the way they are. This way you can use this project to learn the basics of VoiP with Asterisk like I did.
- (Experimental) An Asterisk Manager Interface (AMI) client. While some endpoints (e.g. a cell phone) is not registered, this client buffers the SMS messages. It sends the missed messages to them once the enpoints register to Asterisk. This client is a systemd unit for robustness.
- MIT license: use/modify this project as you like as long as you keep the copyright. Please let me know (a.dentinger@gmail.com) if you use it though ; it will look good on my résumé! :)

**Limitations:**

- This project is not intended to have more than one user ; it is only intended to have multiple phones/softphones belonging to one user.
- I essentially "made my configuration public", so I did not build a way to disable some features. For example, there is no direct way not to use VoipMS without modifying this project's files. It's not difficult to do when you know where to do it (e.g., just delete some stuff in `pjsip.conf` to disable VoipMS stuff), but it's not direct.
- I have a few minor bugs with the AMI client. See [my issues tagged "AMI Client"](https://github.com/AnthonyD973/AsteriskConfig/issues?q=is%3Aissue+is%3Aopen+label%3A%22AMI+Client%22++user%3AAnthonyD973).
- If you want to actually place or receive calls from "real" phones, you will need a VoiP provider. I transferred my regular home phone number to [VoipMS](https://voip.ms/), so this project is configured for VoipMS. However, as I learned while working on this project, each VoiP provider works differently because the SIP protocol allows for multiple ways to connect to a VoiP server. So you will probably have to look at your provider's website about how to configure `pjsip.conf` (*"chan_pjsip"*) to work with your provider and modify this project's `pjsip.conf` file. Additionally, some providers only show how to configure the old `sip.conf` (*"chan_sip"*), in which case you will have to convert the `sip.conf` configuration to `pjsip.conf`.

## How to use this project

### 1. Prepare your network

This project configures Asterisk to use SIP (for registering, starting calls, etc.) and RTP (for the actual voice data). If you want to actually place/receive calls from a VoiP provider, or if you want to be able to use a phone/softphone outside of home, you will need to forward some NAT ports on your router:

- One UDP port for SIP signalling ; use UDP port 5060 if you have no reason not to.
- About 100 UDP ports for RTP ; e.g. UDP 18000-18099.

Notes:

- Take note of which ports you forwarded ; you will need to specify them in the configuration file (explained below).
- If you are running the Asterisk server in a VM, you need to also make sure the ports are forwarded from the host to the VM. I haven't done it, but you will need to either 1) make sure the VM is either NATted or bridged to the host *and* that you forward these ports to the VM, or 2) enable a physical connection from the VM to the network (which I think requires trifling with BIOS and kernel boot arguments). The idea is similar if you run this project inside a container you made.
- If your NAT is a full-cone NAT, you probably won't need to forward the RTP ports because I configured a STUN server in the Asterisk config files. My home router's NAT is not a full-cone NAT, so don't count on it being the case for you! If you don't know what I'm talking about, don't worry about it anyway.
- Obviously, if you put the Asterisk server in your DMZ, there is no need to forward anything. But if you know what I'm talking about, you probably don't need *me* to tell you this!

### 2. Create config file

Create a simple text file based on `sample/config-file-template.txt`. Run `update.sh --help` for an explanation of each variable.

Note that, like many other projects, it's possible that this sample config file is no longer up-to-date at the time you read this. Run `./update.sh --help` for an up-to-date list of variables to set.

### 3. Actually install and setup everything

To **erase** the current asterisk configuration and use this repo's configuration, run as root:

```bash
./update.sh install --conf /your/config/file
```

Note that, even though the `update.sh` script says you can run this project in a Docker container, it's been a while that I tested it, so I'm not sure if it works.
