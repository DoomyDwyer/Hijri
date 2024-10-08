/* HIJRI.JS */

// Functions belonging to hijri_date() function
// Original source file dowloaded from the Internet as:
/* hconv.c
*
* Copyright (c) 1992 by Waleed A. Muhanna
*
* Permission for nonprofit use and redistribution of this software and 
* its documentation is hereby granted without fee, provided that the 
* above copyright notice appear in all copies and that both that copyright 
* notice and this permission notice appear in supporting documentation.
*
* No representation is made about the suitability of this software for any
* purpose.  It is provided "as is" without express or implied warranty.
*
* Send any comments/suggestions/fixes/additions to:
*		wmuhanna@magnus.acs.ohio-state.edu
*
*/

/*
* Translated from C to JavaScript by Steve Dwyer, Jumaada ath-Thania 1421 / September 2000
*
*/

// radians per degree (pi/180)
var RPD = (0.01745329251994329577);

/*
 * Given an integer _n_ and a phase selector (nph=0,1,2,3 for
 * new,first,full,last quarters respectively, function returns the 
 * Julian date/time of the Nth such phase since January 1900.
 * Adapted from "Astronomical  Formulae for Calculators" by 
 * Jean Meeus, Third Edition, Willmann-Bell, 1985.
 */
function tmoonphase(n, nph) {
	var jd;
	var t; 
	var t2;
	var t3;
	var k;
	var ma;
	var sa;
	var tf;
	var xtra;

	k = n + nph/4.0;
	t = k/1236.85;
	t2 = t*t;
	t3 = t2*t;

	jd =  2415020.75933 + 29.53058868*k - 1.178e-4 * t2 - 1.55e-7 * t3 + 3.3e-4 * Math.sin (RPD * (166.56 +132.87*t -0.009173*t2));

	// Sun's mean anomaly
	sa =  RPD * (359.2242 + 29.10535608*k - 3.33e-5 * t2 - 3.47e-6 * t3);

	// Moon's mean anomaly
	ma =  RPD * (306.0253 + 385.81691806*k + 0.0107306*t2 +1.236e-5 *t3);

	// Moon's argument of latitude
	tf = RPD * 2.0 * (21.2964 + 390.67050646*k -0.0016528*t2 -2.39e-6 * t3);

	// should reduce to interval 0-1.0 before calculating further
	if (nph==0 || nph==2) {
		// Corrections for New and Full Moon
		xtra = (0.1734 - 0.000393*t) * Math.sin(sa) +0.0021*Math.sin(sa*2) -0.4068*Math.sin(ma) +0.0161*Math.sin(2*ma) -0.0004*Math.sin(3*ma) +0.0104*Math.sin(tf) -0.0051*Math.sin(sa+ma) -0.0074*Math.sin(sa-ma) +0.0004*Math.sin(tf+sa) -0.0004*Math.sin(tf-sa) -0.0006*Math.sin(tf+ma) +0.0010*Math.sin(tf-ma) +0.0005*Math.sin(sa+ 2*ma);
	}
	else if (nph==1 || nph==3) {
		xtra = (0.1721 - 0.0004*t) * Math.sin(sa) +0.0021*Math.sin(sa*2) -0.6280*Math.sin(ma) +0.0089*Math.sin(2*ma) -0.0004*Math.sin(3*ma) +0.0079*Math.sin(tf) -0.0119*Math.sin(sa+ma) -0.0047*Math.sin(sa-ma) +0.0003*Math.sin(tf+sa) -0.0004*Math.sin(tf-sa) -0.0006*Math.sin(tf+ma) +0.0021*Math.sin(tf-ma) +0.0003*Math.sin(sa+ 2*ma) +0.0004*Math.sin(sa-2*ma) -0.0003*Math.sin(2*sa+ma);
		if (nph==1) {
			xtra = xtra +0.0028 -0.0004*Math.cos(sa) +0.0003*Math.cos(ma);
		}
		else {
			xtra = xtra -0.0028 +0.0004*Math.cos(sa) -0.0003*Math.cos(ma);
		}
	} 
	else {
		return "tmoonphase: illegal phase number";
	}

	// convert from Ephemeris Time (ET) to (approximate) 
	// Universal Time (UT)

	jd += xtra - (0.41 +1.2053*t +0.4992*t2)/1440;
	return (jd);
}


/* parameters for Makkah: for a new moon to be visible after sunset on
   the same day in which it started, it has to have started before
   (SUNSET-MINAGE)-TIMZ=3 A.M. local time. */

var TIMZ = 3.0;
var MINAGE = 13.5;

// approximate
var SUNSET = 19.5;
var TIMDIF = (SUNSET-MINAGE);

function visible(n, rjd) {
	var jd;
	var tf;
	var d;

	jd = tmoonphase(n,0); 
	rjd[0] = jd;
	d = ((jd >= 0) ? Math.floor(jd) : Math.ceil(jd));

	tf = (jd - d);
	if (tf<=0.5) {
		// new moon starts in the afternoon
		return(jd+1.0); 
	}

	// new moon starts before noon
	// local time
	tf = (tf-0.5)*24 +TIMZ;  
	if (tf>TIMDIF) {
		// age at sunset < min for visiblity
		return(jd+1.0);
	}
	return(jd);
}

/*
 * Returns the Julian date (the Julian day number at _time_) of the
 * given calendar date specified by _year_, _month_, and _day_.
 * Positive year signifies A.D.; negative, B.C.
 */
function julianday(year, month, day, time) {
	var jul;
	var m;
	var y;
	var ja;

	if (year<0) year++;
	if (month>2) {
		y = year; 
		m = month;
	} else {
		y = year-1; 
		m = month+12;
	}
	jul = y * 365.25;
	if (y<1) jul -= 0.75;
	jul = ((jul >= 0) ? Math.floor(jul) : Math.ceil(jul));
	jul = jul + ((m+1 >= 0) ? Math.floor(30.6001 * (m+1)) : Math.ceil(30.6001 * (m+1)));
	jul = jul + day + time + 1720994.5;

	if (year+month*1e-2 +(day+time)*1e-4 >= 1582.1015) {
		// cross-over to Gregorian calendar
		ja = ((y >= 0) ? Math.floor(0.01 * y) : Math.ceil(0.01 * y));
		jul = jul +2 -ja + ((ja >= 0) ? Math.floor(0.25*ja) : Math.ceil(0.25*ja));
	}
	return jul;
}

/* 
 * inverse function of Julianday.
 */
function caldate(julday) {
	var z;
	var alpha;
	var a;
	var b;
	var c;
	var d;
	var e;
	var f;

	julday += 0.5; 
	z = Math.floor(julday); 
	f = julday-z;

	// test whether to change to Gregorian cal
	if (z<2299161){
		a = z;
	}
	else {
		alpha = Math.floor((Math.floor(z-1867216.25)) / 36524.25);
		a = z + 1 +alpha - Math.floor(alpha / 4);
	}
	b = a + 1524;  
	c = Math.floor((b - 122.1) / 365.25);
	d = Math.floor(365.25 * c);

	e = Math.floor((b-d) / 30.6001);
	f += b -d - Math.floor(30.6001*e);

	this.day = Math.floor(f);
	this.time = f - this.day;
	this.mon = Math.floor(((e>13) ? e-13 : e-1));
	this.year = Math.floor(((this.mon>2) ? c-4716 : c-4715));

	this.dw = Math.floor((julday - this.time + 1.1) % 7);
	if (this.year<=0) this.year--;

	return;
}

/*
 * Given a gregorian/julian date, compute corresponding Hijri date structure 
 * As a reference point, the routine uses the fact that the year
 * 1405 A.H. started immediatly after lunar conjunction number 1048
 * which occured on September 1984 25d 3h 10m UT.
 */
function hdate () {
	var y = this.year;
	var m = this.mon;
	var d = this.day;

	var jd;
	var mjd;
	// Use an array to accomplish passing variable by reference
	var rjd = new Array(1);
	var k;
	var hm;

	jd = julianday(y, m, d, 0.00); 

	// obtain first approx. of how many new moons since the beginning of the year 1900
	k = 0.6 + (y + ((m-0.5 >= 0) ? Math.floor(m-0.5): Math.ceil(m-0.5)) /12.0 + d/365.0 - 1900) *12.3685;

	k = ((k >= 0) ? Math.floor(k) : Math.ceil(k));

	do {
		mjd = visible(k--, rjd);
	} while (mjd>jd);  
	k++;

	// first of the month is the following day
	hm = k -1048;  

	this.year = 1405 + (((hm / 12) >= 0) ? Math.floor(hm / 12) :  Math.ceil(hm / 12));

	this.mon =  (hm % 12) +1; 

	if (hm !=0 && this.mon <= 0) {
		this.mon +=12; 
		this.year--;
	}
	if (this.year<=0) this.year--;

	this.day = ((jd -mjd >= 0) ? Math.floor(jd -mjd) : Math.ceil(jd -mjd)) +1.0;
	this.time = 0.5;
	this.dw = ((jd+1.5 >= 0) ? Math.floor(jd+1.5) : Math.floor(jd+1.5)) % 7;

	return;
}

var NMONTHS = (1405*12+1);

/*
 * Given a Hijri date, compute corresponding C.E. date structure 
 */
function gdate() {
	var y = this.year;
	var m = this.mon;
	var d = this.day;

	var jd;
	// Use an array to accomplish passing variable by reference
	var rjd = new Array(1);
	var k;

	if (y<0) y++;

	// # of months since 1/1/1405
	k = m + y * 12 - NMONTHS;

	jd = visible(k + 1048, rjd) + d;

	this.caldate(jd);
	this.nmtime = rjd[0];
	return;
}

/*
 * Return number of days in a given month of the Gregorian calendar
 */
function ndays(m,y) {
	var ndmnth = new Array(0,31,28,31,30,31,30,31,31,30,31,30,31);

	var nd = ndmnth[m];
	if (m == 2 && (y % 4 == 0 && (y < 1582 || y % 100 != 0 || y % 400 == 0))) {
		// Leap year: add an extra day for February
		nd++;
	}
	return nd;
}

// Original source file dowloaded from the Internet as:
/*  hdate.c  v1.1
*
* Copyright (c) 1992 by Waleed A. Muhanna
*
* Permission for nonprofit use and redistribution of this software and 
* its documentation is hereby granted without fee, provided that the 
* above copyright notice appear in all copies and that both that copyright 
* notice and this permission notice appear in supporting documentation.
*
* No representation is made about the suitability of this software for any
* purpose.  It is provided "as is" without express or implied warranty.
*
* Send any comments/suggestions/fixes/additions to: 
*		wmuhanna@magnus.acs.ohio-state.edu
*
*/

/*
* Translated from C to JavaScript by Steve Dwyer, Jumaada ath-Thania 1421 / September 2000
*
*/

// Class definition for sdate class
function sdate (pnDay, pnMonth, pnYear, plHflag) {
	this.time = 0.00;
	this.day = pnDay;
	this.mon = pnMonth;
	this.year = pnYear;
	this.dw = 0;
	this.nmtime = 0.00;
	this.Hflag = plHflag;

	// The methods
	this.caldate = caldate;
	this.hdate = hdate;
	this.gdate = gdate;
}

// Main function for date conversion
function main(arg1, arg2, arg3, arg4) {
	// Return passed gregorian date as the correspoding date in the Hijri calendar, or
	// passed Hijri date as the corresponding gregorian date 
	// (-h switch required for conversion from Hijri, use usage)
	//
	// Usage: hijri_date( [ [day, month, year] | [-h, hday, hmonth, hyear,] ] )

	var lnDay = 0;
	var lnMonth = 0;
	var lnYear = 0;
	var llHflag = false;

	if (arg1 == '-h' && arg4 != null) {
		// -h switch passed -
		// set flag to indicate this and shift parameters up one place
		llHflag = true;
		arg1 = arg2;
		arg2 = arg3;
		arg3 = arg4;
		arg4 = null;
	}

	if (arg1 == null) {
		if (llHflag) {
			// -h switch was passed without passing a Hijri date
			return "Hijri date must be given";
		}

		var ldDate = new Date();
		lnDay = ldDate.getDate(); 
		lnMonth = ldDate.getMonth() + 1; 
		lnYear = ldDate.getFullYear(); 
	} 
	else if (arg1 != null && arg2 != null && arg3 != null && arg4 == null) {
		// Correct number of parameters passed
		lnDay = arg1;
		lnMonth = arg2;
		lnYear = arg3;

		// Perform validations on input
		if (lnMonth < 1 || lnMonth > 12) {
			return "Invalid month number specified";
		}
		if (lnYear == 0 || (!llHflag && lnYear < 0)) {
			return "Invalid year specified";
		}
		if (llHflag && lnDay > 30) {
			return "Invalid Hijri day number specified";
		}
		if (lnDay < 1 || (!llHflag && lnDay > ndays(lnMonth , lnYear))) {
			return "Invalid day number specified";
		}
	}
	else {
		return 'Usage: hijri_date( [ [day, month, year] | [-h, hday, hmonth, hyear,] ] )';
	}

	// Create an sdate object
	var sd = new sdate(lnDay, lnMonth, lnYear, llHflag);

	if (sd.Hflag) {
		// Calculate Gegorian Date
		sd.gdate();

		// Formulate return value
		lcRetVal = laDOW[sd.dw] + ' ' + sd.day + ' ' + laMonths[sd.mon - 1] + ' ' + sd.year;
	} 
	else {
		// Calculate Hijri date
		sd.hdate();

		// Formulate return value
		lcRetVal = laHDOW[sd.dw] + ' ' + sd.day + ' ' + laHMonths[sd.mon - 1];
	
		// Extra exception for dates before Hijra
		if (sd.year > 0) {
			lcRetVal = lcRetVal + ' ' + sd.year;
		}
		else {
			lcRetVal = lcRetVal + ' ' + -sd.year + ' B.H.';
		}
	}
	return lcRetVal;
}

function todays_hijri_date() {
	// Returns today's date in the hijri calendar as a string
	var ldDate = new Date(); 
	var lnDay = ldDate.getDate(); 
	var lnMonth = ldDate.getMonth() + 1; 
	var lnYear = ldDate.getFullYear(); 

	// Call the function to return today's date in the hijri calendar as a string
	return main(lnDay, lnMonth, lnYear);
}

function todays_date() {
	// Returns today's date as a string

	var ldDate = new Date(); 
	var lnWeekday = ldDate.getDay(); 
	var lnDay = ldDate.getDate(); 
	var lnMonth = ldDate.getMonth() + 1; 
	var lnYear = ldDate.getFullYear(); 

	// Retrieve day of week from array
	var lcWeekdayName = laDOW[lnWeekday];

	// Retrieve month from array
	var lcMonthName = laMonths[lnMonth -1];

	return lcWeekdayName + ' ' + lnDay + ' ' + lcMonthName + ' ' + lnYear;
}
