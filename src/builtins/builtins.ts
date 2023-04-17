import * as synthsJSON from './synths.json'
import * as fxJSON from './fx.json'

export const commands: { token: string; description?: string }[] = [
	{ token: 'play', description: 'Play a note using the most recently set synthesizer.' },
	{ token: 'zplay', description: 'Play Ziffers syntax' },
	{ token: 'zstop', description: 'Stop all zloop threads' },
	{ token: 'zkill', description: 'Kill all threads' },
	{ token: 'sleep', description: 'Sleep for a given number of beats' },
	{ token: 'sample', description: 'Play a prerecorded sample' },
	{ token: 'use_synth', description: 'Set the synthesizer for future `play` calls' },
	{ token: 'loop', description: 'Loop a segment' },
	{ token: 'sync', description: 'Wait until a corresponding `cue` has been triggered' },
	{ token: 'cue', description: 'Dispatch to all listening `sync` waits to continue execution' },
	{ token: 'with_fx', description: 'Build a new effect and run a segment using it' },
	{ token: 'control', description: 'Modify an existing operation' },
	{ token: 'live_loop', description: 'Create a loop running in a new thread with a given name' },
	{ token: 'tick', description: 'Increment and access the live_loop counter' },
	{ token: 'look', description: 'Access the live_loop counter' },
	{ token: 'choose', description: 'Select a random entry from the list' },
]

type BuiltIn = {
	name: string
	id: string
	detail: string
	options: {
		name: string
		detail: string
		default?: string
		can_slide?: boolean
	}[]
}

export const synths: BuiltIn[] = synthsJSON

export const fx: BuiltIn[] = fxJSON.map((f) => ({
	...f,
	options: [
		...f.options,
		{
			name: 'reps',
			default: '1',
			detail: 'Number of times to repeat this effect segment',
		},
	],
}))

const _scales: string[] = [
	"acem_asiran","acem_kurdi","acemli_rast","aeolian","aeolian1b","aeolian3s","aeolian7s",
	"ahirbhairav","augmented","augmented2","bartok","bayati","bayati_2","bayati_araban","bestenigar",
	"bhairav","blues_major","blues_minor","buselik","buselik_2","cargah","chinese","chromatic","diatonic",
	"diminished","diminished2","dorian","dorian4s","dorian5b","dorian7s","dugah","dugah_2","egyptian","enigmatic",
	"evcara","evcara_2","evcara_3","evcara_4","evic","evic_2","ferahfeza","ferahfeza_2","ferahnak","gong","gulizar",
	"harmonic_major","harmonic_minor","hex_aeolian","hex_dorian","hex_major6","hex_major7","hex_phrygian","hex_sus","hicaz",
	"hicaz_2","hicaz_humayun","hicaz_humayun_2","hicazkar","hicazkar_2","hindu","hirajoshi","hungarian_minor","huseyni",
	"huseyni_2","huzzam","huzzam_2","indian","ionian","ionian1s","ionian5s","ionian6b","isfahan","isfahan_2","iwato",
	"jiao","karcigar","kumoi","kurdi","kurdili_hicazkar","kurdili_hicazkar_2","kurdili_hicazkar_3","kurdili_hicazkar_4",
	"kurdili_hicazkar_5","leading_whole","locrian","locrian2s","locrian6s","locrian7b","locrian_major","lydian","lydian2s",
	"lydian3b","lydian5s","lydian_minor","mahur","major","major_pentatonic","marva","melodic_major","melodic_minor",
	"melodic_minor_asc","melodic_minor_desc","messiaen1","messiaen2","messiaen3","messiaen4","messiaen5","messiaen6","messiaen7",
	"minor","minor_pentatonic","mixolydian","mixolydian1s","mixolydian2b","mixolydian4s","muhayyer","neapolitan_major","neapolitan_minor",
	"neva","neva_2","nihavend","nihavend_2","octatonic","pelog","phrygian","phrygian3s","phrygian4b","phrygian6s","prometheus","purvi",
	"rast","ritusen","romanian_minor","saba","scriabin","sedaraban","sedaraban_2","segah","segah_2","sehnaz","sehnaz_2","sehnaz_3",
	"sehnaz_4","sevkefza","sevkefza_2","sevkefza_3","shang","spanish","sultani_yegah","sultani_yegah_2","super_locrian","suzidil",
	"suzidil_2","suznak","suznak_2","tahir","tahir_2","todi","ussak","uzzal","uzzal_2","whole","whole_tone","yegah","yegah_2","yu",
	"zhi","zirguleli_hicaz","zirguleli_hicaz_2","zirguleli_suznak","zirguleli_suznak_2","zirguleli_suznak_3"]

const _samples: string[] = [
	'drum_heavy_kick',
	'drum_tom_mid_soft',
	'drum_tom_mid_hard',
	'drum_tom_lo_soft',
	'drum_tom_lo_hard',
	'drum_tom_hi_soft',
	'drum_tom_hi_hard',
	'drum_splash_soft',
	'drum_splash_hard',
	'drum_snare_soft',
	'drum_snare_hard',
	'drum_cymbal_soft',
	'drum_cymbal_hard',
	'drum_cymbal_open',
	'drum_cymbal_closed',
	'drum_cymbal_pedal',
	'drum_bass_soft',
	'drum_bass_hard',
	'elec_triangle',
	'elec_snare',
	'elec_lo_snare',
	'elec_hi_snare',
	'elec_mid_snare',
	'elec_cymbal',
	'elec_soft_kick',
	'elec_filt_snare',
	'elec_fuzz_tom',
	'elec_chime',
	'elec_bong',
	'elec_twang',
	'elec_wood',
	'elec_pop',
	'elec_beep',
	'elec_blip',
	'elec_blip2',
	'elec_ping',
	'elec_bell',
	'elec_flip',
	'elec_tick',
	'elec_hollow_kick',
	'elec_twip',
	'elec_plip',
	'elec_blup',
	'guit_harmonics',
	'guit_e_fifths',
	'guit_e_slide',
	'guit_em9',
	'misc_burp',
	'perc_bell',
	'perc_snap',
	'perc_snap2',
	'ambi_soft_buzz',
	'ambi_swoosh',
	'ambi_drone',
	'ambi_glass_hum',
	'ambi_glass_rub',
	'ambi_haunted_hum',
	'ambi_piano',
	'ambi_lunar_land',
	'ambi_dark_woosh',
	'ambi_choir',
	'bass_hit_c',
	'bass_hard_c',
	'bass_thick_c',
	'bass_drop_c',
	'bass_woodsy_c',
	'bass_voxy_c',
	'bass_voxy_hit_c',
	'bass_dnb_f',
	'sn_dub',
	'sn_dolf',
	'sn_zome',
	'bd_ada',
	'bd_pure',
	'bd_808',
	'bd_zum',
	'bd_gas',
	'bd_sone',
	'bd_haus',
	'bd_zome',
	'bd_boom',
	'bd_klub',
	'bd_fat',
	'bd_tek',
	'loop_industrial',
	'loop_compus',
	'loop_amen',
	'loop_amen_full',
	'loop_garzul',
	'loop_mika',
	'loop_breakbeat',
]

const sample_player = synths.find((synth) => synth.id === 'mono_player')

export const samples: BuiltIn[] = _samples.map((sample) => ({
	id: sample,
	detail: '',
	name: '',
	options: sample_player!.options,
}))

export const scales: BuiltIn[] = _scales.map((scale) => ({
	id: scale,
	detail: '',
	name: '',
	options: [{
		name:  '',
		detail: ''
	}]
}))
