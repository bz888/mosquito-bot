import {config} from 'dotenv';
import {ChannelType, Client, ClientOptions, GatewayIntentBits, Message, VoiceChannel, VoiceState,} from 'discord.js';
import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    generateDependencyReport,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus,
} from '@discordjs/voice';
import * as fs from "node:fs";

config();

const discordClientOpts: ClientOptions = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
};
const discordClient = new Client(discordClientOpts);

const { TOKEN } = process.env;

let isTalking = false;
let channel: VoiceChannel | null = null;
let voiceConnection: VoiceConnection | null = null;

const player = createAudioPlayer();

const targetList: string[] = [
    '287303292860760064', // louis
    '394298648487395328', // kisoon
    '163604146849579008', // gerard
    '209931476735623168', // andrew
    '193734371830792194', // tyrell
    '229037006754283522', // rhys
    '390459901245128707' // tristan
];


let onOff = true;

console.log(generateDependencyReport());
interface Command {
    help: string;
    execute: (message: Message) => void;
}

const TEST_CHANNEL = '757389067762794586'
const Commands: Record<string, Command> = {
    'stop': {
        help: 'Turn off.',
        execute: () => {
            if (voiceConnection) {
                voiceConnection.destroy();
            }
            onOff = false;
        }
    },
    'start': {
        help: 'Turn on.',
        execute: () => {
            onOff = true;
            checkForUsersInVoice();
        }
    },
    'play': {
        help: 'Check and play audio.',
        execute: async () => {
            await joinAndPlay();
        }
    }
};



const canPlayAudio = () => {
    if (voiceConnection && voiceConnection.state.status === VoiceConnectionStatus.Ready) {
        console.log('Voice connection is ready. Playing audio...');
        play();
    } else {
        console.log('Voice connection is not ready.');
    }
};


discordClient.on('ready', () => {
    console.log('Ready');
});


const prefix = 'mos!'

discordClient.on('messageCreate', (message) => {
    let content = message.content;
    if (content.startsWith(prefix)) {
        let cmd = content.substr(prefix.length).split(' ')[0];
        if (Commands[cmd]) {
            Commands[cmd].execute(message);
        } else {
            message.reply('Command not found, use "mos!help" to see commands.');
        }
    }
});

const joinAndPlay = async () => {
    const voiceChannel = await discordClient.channels.fetch(TEST_CHANNEL) as VoiceChannel;

    if (!voiceConnection || voiceConnection.state.status !== VoiceConnectionStatus.Ready) {
        voiceConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        voiceConnection.subscribe(player);

        voiceConnection.on(VoiceConnectionStatus.Ready, () => {
            console.log('Joined the voice channel and playing audio...');
            play();
        });

        voiceConnection.on('error', error => {
            console.error('Voice connection error:', error);
            console.log('Failed to join the voice channel.');
        });
    } else {
        play();
    }
};

discordClient.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
    if (targetList.includes(oldState.id) && targetList.includes(newState.id) && onOff) {
        if (!oldState.channelId && newState.channelId) {
            channel = await discordClient.channels.fetch(newState.channelId) as VoiceChannel;
            if (channel) {
                voiceConnection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                });
                voiceConnection.subscribe(player);

                voiceConnection.on(VoiceConnectionStatus.Ready, () => {
                    subscribeToSpeakingEvents(voiceConnection!);
                });
            }
        }
        if (oldState.channelId && !newState.channelId && voiceConnection) {
            console.log('should leave the channel');
            const connection = getVoiceConnection(channel!.guild.id);
            if (connection) {
                connection.disconnect();
            }
            voiceConnection = null;
        }
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            channel = await discordClient.channels.fetch(newState.channelId) as VoiceChannel;
            if (channel) {
                voiceConnection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                });
                voiceConnection.subscribe(player);

                voiceConnection.on(VoiceConnectionStatus.Ready, () => {
                    subscribeToSpeakingEvents(voiceConnection!);
                });
            }
        }
    }
});


const subscribeToSpeakingEvents = (connection: VoiceConnection) => {
    const receiver = connection.receiver;

    receiver.speaking.on('start', userId => {
        if (targetList.includes(userId)) {
            console.log("a member is speaking", userId);
                if (player.state.status === AudioPlayerStatus.Paused) {
                    console.log("Resuming audio");
                    player.unpause();
                } else {
                    play();
                }
                isTalking = true;
            }
    });

    receiver.speaking.on('end', userId => {
        if (targetList.includes(userId) && player) {
            console.log("a member stopped speaking", userId);
            player.pause();
            isTalking = false;
        }
    });
};



const play = () => {
    console.log("Attempting to play audio");
    try {
        const audioFilePath = './donnie.mp3';
        if (!fs.existsSync(audioFilePath)) {
            console.error('Audio file does not exist:', audioFilePath);
        }

        const resource = createAudioResource(audioFilePath, { inlineVolume: true });
        resource.volume?.setVolume(1); // Set volume to 50%

        if (player.checkPlayable()) {
            player.unpause()
        } else {
            player.play(resource);
        }

        player.on(AudioPlayerStatus.Playing, () => {
            console.log("Playing audio");
        })
        player.on(AudioPlayerStatus.Buffering, () => {
            console.log("Buffering audio");
        })

        player.on(AudioPlayerStatus.Paused, () => {
            console.log("Paused audio");
        })

        player.on(AudioPlayerStatus.Idle, () => {
            console.log("Audio player is idle");
            if (isTalking) {
                play();
            }
        });

        player.on('error', error => {
            console.error("Error playing audio:", error);
        });
    } catch (error) {
        console.error("Error in play function:", error);
    }
};


const checkForUsersInVoice = () => {
    const vcs = discordClient.channels.cache.filter(c => c.type === ChannelType.GuildVoice) as Map<string, VoiceChannel>;

    vcs.forEach(async (voiceChannel) => {
        for (const target of targetList) {
            if (voiceChannel.members.has(target)) {
                channel = voiceChannel;
                if (channel.guild && channel.guild.voiceAdapterCreator) {
                    voiceConnection = joinVoiceChannel({
                        channelId: channel.id,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator,
                    });
                    voiceConnection.subscribe(player);

                    voiceConnection.on(VoiceConnectionStatus.Ready, () => {
                        subscribeToSpeakingEvents(voiceConnection!);
                    });
                    return;
                }
            }
        }
    });

    if (voiceConnection) {
        voiceConnection.destroy();
        voiceConnection = null;
    }
};

discordClient.login(TOKEN!).then(() => {
    console.log("login success");
});
