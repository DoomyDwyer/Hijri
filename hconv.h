#ifndef KCALENDARSYSTEM_HCONV_H
    2 #define KCALENDARSYSTEM_HCONV_H
    3 
    4 
    5 
    6 #ifdef __cplusplus
    7     extern "C" {
    8 #endif
    9 
   10 extern const char   *mname[], *hmname[], *dow[], *sdow[], *hmnameshort[];
   11 
   12 typedef struct sdate {
   13     float time;
   14     int day;
   15     int mon;
   16     int year;
   17     int dw;
   18     double nmtime;
   19 } SDATE;
   20 
   21 extern SDATE *caldate(double), *hdate(int,int,int), *gdate(int,int,int);
   22 
   23 extern double tmoonphase(long,int), julianday(int,int,int,float);
   24 extern int ndays(int,int);
   25 
   26 extern double visible(long, double*);
   27 
   28 #ifdef __cplusplus
   29     }
   30 #endif
   31 
   32 #define NULLP    ((char *)0)
   33 
   34 /* for portability */
   35 #include <sys/types.h>
   36 
   37 #endif