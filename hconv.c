
    2 /* hconv.c
    3  *
    4  * Copyright (c) 1992 by Waleed A. Muhanna
    5  *
    6  * Permission for nonprofit use and redistribution of this software and 
    7  * its documentation is hereby granted without fee, provided that the 
    8  * above copyright notice appear in all copies and that both that copyright 
    9  * notice and this permission notice appear in supporting documentation.
   10  *
   11  * No representation is made about the suitability of this software for any
   12  * purpose.  It is provided "as is" without express or implied warranty.
   13  *
   14  * Send any comments/suggestions/fixes/additions to:
   15  *      wmuhanna@magnus.acs.ohio-state.edu
   16  *
   17  */
   18 
   19 #include <math.h>
   20 #include "hconv.h"
   21 
   22 #define RPD     (0.01745329251994329577) /* radians per degree (pi/180) */
   23 
   24 const char  *dow[]= {
   25     "Yaum al-Ithnain", " Yau al-Thulatha", " Yaum al-Arbi'a",
   26     "Yaum al-Khamees", "Yaum al-Jumma", "Yaum al-Sabt", "Yaum al-Ahad"
   27 };
   28 
   29 const char *sdow[] = {
   30      "Ith", "Thl", "Arb", "Kha", "Jum", "Sab", "Ahd"
   31 };
   32 
   33 const char  *mname[]= {
   34     "January", "February", "March", "April",
   35     "May", "June", "July", "August",
   36     "September", "October", "November", "December"
   37 };
   38 
   39 const char  *hmname[] = {
   40     "Muharram", "Safar", "Rabi` al-Awal", "Rabi` al-Thaani",
   41     "Jumaada al-Awal", "Jumaada al-Thaani", "Rajab", "Sha`ban",
   42     "Ramadan", "Shawwal", "Thu al-Qi`dah", "Thu al-Hijjah"
   43 };
   44 
   45 const char  *hmnameshort[] = {
   46     "Muharram", "Safar", "R. Awal", "R. Thaani",
   47     "J. Awal", "J. Thaani", "Rajab", "Sha`ban",
   48     "Ramadan", "Shawwal", "Qi`dah", "Hijjah"
   49 };
   50 /*
   51  * Given an integer _n_ and a phase selector (nph=0,1,2,3 for
   52  * new,first,full,last quarters respectively, function returns the
   53  * Julian date/time of the Nth such phase since January 1900.
   54  * Adapted from "Astronomical  Formulae for Calculators" by
   55  * Jean Meeus, Third Edition, Willmann-Bell, 1985.
   56  */
   57 double
   58 tmoonphase( n, nph)
   59     long n; int nph;
   60 {
   61     double jd, t, t2, t3, k, ma, sa, tf, xtra;
   62     k = n + nph/4.0;  t = k/1236.85;  t2 = t*t; t3 = t2*t;
   63     jd =  2415020.75933 + 29.53058868*k - 1.178e-4 * t2
   64         - 1.55e-7 * t3
   65         + 3.3e-4 * sin (RPD * (166.56 +132.87*t -0.009173*t2));
   66 
   67     /* Sun's mean anomaly */
   68     sa =  RPD * (359.2242 + 29.10535608*k - 3.33e-5 * t2 - 3.47e-6 * t3);
   69 
   70     /* Moon's mean anomaly */
   71     ma =  RPD * (306.0253 + 385.81691806*k + 0.0107306*t2 +1.236e-5 *t3);
   72 
   73     /* Moon's argument of latitude */
   74     tf = RPD * 2.0 * (21.2964 + 390.67050646*k -0.0016528*t2
   75               -2.39e-6 * t3);
   76 
   77     /* should reduce to interval 0-1.0 before calculating further */
   78     if (nph==0 || nph==2)
   79         /* Corrections for New and Full Moon */
   80         xtra = (0.1734 - 0.000393*t) * sin(sa)
   81               +0.0021*sin(sa*2)
   82               -0.4068*sin(ma) +0.0161*sin(2*ma) -0.0004*sin(3*ma)
   83               +0.0104*sin(tf)
   84               -0.0051*sin(sa+ma) -0.0074*sin(sa-ma)
   85               +0.0004*sin(tf+sa) -0.0004*sin(tf-sa)
   86               -0.0006*sin(tf+ma) +0.0010*sin(tf-ma)
   87               +0.0005*sin(sa+ 2*ma);
   88     else if (nph==1 || nph==3) {
   89         xtra = (0.1721 - 0.0004*t) * sin(sa)
   90               +0.0021*sin(sa*2)
   91               -0.6280*sin(ma) +0.0089*sin(2*ma) -0.0004*sin(3*ma)
   92               +0.0079*sin(tf)
   93               -0.0119*sin(sa+ma) -0.0047*sin(sa-ma)
   94               +0.0003*sin(tf+sa) -0.0004*sin(tf-sa)
   95               -0.0006*sin(tf+ma) +0.0021*sin(tf-ma)
   96               +0.0003*sin(sa+ 2*ma) +0.0004*sin(sa-2*ma)
   97               -0.0003*sin(2*sa+ma);
   98         if (nph==1)
   99             xtra = xtra +0.0028 -0.0004*cos(sa) +0.0003*cos(ma);
  100         else
  101             xtra = xtra -0.0028 +0.0004*cos(sa) -0.0003*cos(ma);
  102     } else {
  103         /*printf("tmoonphase: illegal phase number\n"); */
  104         exit(1);
  105     }
  106     /* convert from Ephemeris Time (ET) to (approximate) 
  107        Universal Time (UT) */
  108     jd += xtra - (0.41 +1.2053*t +0.4992*t2)/1440;
  109     return (jd);
  110 }
  111 
  112 
  113 /* parameters for Makkah: for a new moon to be visible after sunset on
  114    a the same day in which it started, it has to have started before
  115    (SUNSET-MINAGE)-TIMZ=3 A.M. local time. */
  116 
  117 #define TIMZ 3.0
  118 #define MINAGE 13.5
  119 #define SUNSET 19.5 /*approximate */
  120 #define TIMDIF (SUNSET-MINAGE) 
  121 
  122 double
  123 visible(n, rjd)
  124     long n;
  125     double *rjd;
  126 {
  127     double jd;
  128     float tf;
  129     long d;
  130 
  131     jd = tmoonphase(n,0);  *rjd = jd;
  132     d = jd;
  133     tf = (jd - d);
  134     if (tf<=0.5)  /*new moon starts in the afternoon */
  135         return(jd+1.0); 
  136     /* new moon starts before noon */
  137     tf = (tf-0.5)*24 +TIMZ;  /* local time */ 
  138     if (tf>TIMDIF) return(jd+1.0);  /*age at sunset < min for visiblity*/
  139     return(jd);
  140 }
  141 
  142 /*
  143  * Returns the Julian date (the Julian day number at _time_) of the
  144  * given calendar date specified by _year_, _month_, and _day_.
  145  * Positive year signifies A.D.; negative, B.C.
  146  */
  147 double
  148 julianday( int year, int month, int day, float time)
  149 {
  150     double jul;
  151     long m,y,ja;
  152 
  153     if (year<0) year++;
  154     if (month>2) {
  155         y = year; m =month;
  156     } else {
  157         y = year-1; m =month+12;
  158     }
  159     jul = ((double)y) * 365.25;
  160     if (y<1) jul -= 0.75;
  161     jul = ((long) jul) + ( (long) (30.6001*(m+1))) +day +time +1720994.5;
  162     if (year +month*1e-2 +(day+time)*1e-4 >= 1582.1015) {
  163         /* cross-over to Gregorian calendar */
  164         ja = 0.01*y;
  165         jul = jul +2 -ja + ((long) (0.25*ja));
  166     }
  167     return jul;
  168 }
  169 
  170 /* 
  171  * inverse function of Julianday.
  172  */
  173 SDATE *
  174 caldate( julday )
  175     double  julday;
  176 {
  177     static SDATE sd;
  178     long    z, alpha, a, b, c, d, e;
  179     double  f;
  180 
  181     julday += 0.5; z = julday; f = julday-z;
  182     if ( z<2299161L )  /* test whether to change to Gregorian cal */
  183         a = z;
  184     else {
  185         alpha = (z-1867216.25) / 36524.25;
  186         a     = z + 1 +alpha - alpha / 4;
  187     }
  188     b = a + 1524;  c = (b - 122.1) / 365.25; d = 365.25 * c;
  189     e = (b-d) / 30.6001;
  190     f += b -d - ((long) (30.6001*e));
  191     sd.day = f;
  192     sd.time = f-sd.day;
  193     sd.mon = (e>13) ? e-13 : e-1;
  194     sd.year = (sd.mon>2) ? c-4716 : c-4715;
  195     /*
  196     sd.dw = ((long) (julianday(sd.year,sd.mon, sd.day, 0.0) + 1.5)) % 7;
  197     */
  198     sd.dw = ((long) (julday -sd.time + 1.1)) % 7;
  199     if ( sd.year<=0) sd.year--;
  200     return(&sd);
  201 }
  202 
  203         
  204 
  205 /*
  206  * Given a gregorian/julian date, compute corresponding Hijri date structure 
  207  * As a reference point, the routine uses the fact that the year
  208  * 1405 A.H. started immediatly after lunar conjunction number 1048
  209  * which occured on September 1984 25d 3h 10m UT.
  210  */
  211 SDATE *
  212 hdate (y,m,d)
  213     int y, m, d;
  214 {
  215     static SDATE h;
  216     double jd, mjd, rjd;
  217     long k, hm;
  218 
  219     jd = julianday(y,m,d,0.00); 
  220     /* obtain first approx. of how many new moons since the beginning
  221        of the year 1900 */
  222     k = 0.6 + (y + ((int) (m-0.5)) /12.0 + d/365.0 - 1900) *12.3685;
  223     do  {mjd = visible(k--, &rjd);} while (mjd>jd);  k++;
  224     /*first of the month is the following day*/
  225     hm = k -1048;  
  226     h.year = 1405 + (hm / 12);
  227 
  228     h.mon =  (hm % 12) +1; 
  229     if (hm !=0 && h.mon<=0) {h.mon +=12; h.year--; }
  230     if (h.year<=0) h.year--;
  231     h.day = jd -mjd +1.0;
  232     h.time = 0.5;
  233     h.dw = ((long) (jd+1.5)) % 7;
  234     return(&h);
  235 }
  236 
  237 #define NMONTHS  (1405*12+1)
  238 
  239 /*
  240  * Given a Hijri date, compute corresponding C.E. date structure 
  241  */
  242 SDATE *
  243 gdate( y, m, d)
  244     int y,m,d;
  245 {
  246     double jd, rjd;
  247     long k;
  248     SDATE *sd;
  249 
  250     if (y<0) y++;
  251     k = m+ y*12 - NMONTHS;   /* # of months since 1/1/1405 */
  252     jd = visible(k+1048L, &rjd) +d;
  253     sd = caldate(jd);
  254     sd->nmtime = rjd;
  255     return (sd);
  256 }
  257 
  258 
  259 int
  260 ndays(m,y)
  261     int m,y;
  262 {
  263     static short  ndmnth[13] = {0,31,28,31,30,31,30,31,31,30,31,30,31};
  264 
  265     int nd = ndmnth[m];
  266     if (m==2 && (y%4==0 && (y<1582 || y%100!=0 || y%400==0))) nd++;
  267     return nd;
  268 }